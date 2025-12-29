/**
 * Christmas Wonderland - Backend Server
 * Node.js + Express RESTful API Server
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');

const app = express();

// ============================================
// Configuration
// ============================================
const PORT = process.env.PORT || 3000;
const JWT_EXPIRES_IN = '7d';
const SALT_ROUNDS = 10;
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB default
const MAX_FILE_SIZE_MB = Math.round(MAX_FILE_SIZE / (1024 * 1024));

// JWT Secret validation - require explicit secret in production
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('❌ FATAL: JWT_SECRET must be set in production environment');
  process.exit(1);
}
const jwtSecret = JWT_SECRET || 'christmas-wonderland-dev-secret-key';

// ============================================
// Database Connection Pool
// ============================================
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'christmas_wonderland',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

// ============================================
// Middleware
// ============================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// ============================================
// Rate Limiting
// ============================================
// General rate limit for all requests
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Strict rate limit for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth requests per windowMs
  message: { error: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply general rate limit to all API routes
app.use('/api/', generalLimiter);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `image-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// ============================================
// Authentication Middleware
// ============================================
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Optional authentication - doesn't fail if no token
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, jwtSecret, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  next();
}

// ============================================
// Error Handler
// ============================================
function errorHandler(err, req, res, next) {
  console.error('Error:', err.message);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.` });
    }
    return res.status(400).json({ error: err.message });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}

// ============================================
// API Routes
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// Authentication Routes
// ============================================

// POST /api/auth/register - User registration
app.post('/api/auth/register', authLimiter, async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    );

    // Generate token
    const token = jwt.sign(
      { id: result.insertId, username, email },
      jwtSecret,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: result.insertId, username, email },
      token
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login - User login
app.post('/api/auth/login', authLimiter, async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    const [users] = await pool.execute(
      'SELECT id, username, email, password_hash, avatar FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      jwtSecret,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// Wishes Routes
// ============================================

// GET /api/wishes - Get all wishes
app.get('/api/wishes', async (req, res, next) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = 'SELECT id, name, content, category, is_anonymous, created_at FROM wishes';
    const params = [];

    if (category && ['nice', 'naughty'].includes(category)) {
      query += ' WHERE category = ?';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [wishes] = await pool.execute(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM wishes';
    if (category && ['nice', 'naughty'].includes(category)) {
      countQuery += ' WHERE category = ?';
    }
    const [countResult] = await pool.execute(
      countQuery,
      category && ['nice', 'naughty'].includes(category) ? [category] : []
    );

    res.json({
      wishes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/wishes - Create a new wish
app.post('/api/wishes', optionalAuth, async (req, res, next) => {
  try {
    const { name, content, category = 'nice', is_anonymous = false } = req.body;

    if (!name || !content) {
      return res.status(400).json({ error: 'Name and content are required' });
    }

    if (!['nice', 'naughty'].includes(category)) {
      return res.status(400).json({ error: 'Category must be "nice" or "naughty"' });
    }

    const userId = req.user ? req.user.id : null;

    const [result] = await pool.execute(
      'INSERT INTO wishes (user_id, name, content, category, is_anonymous) VALUES (?, ?, ?, ?, ?)',
      [userId, name, content, category, is_anonymous ? 1 : 0]
    );

    // Update stats
    await pool.execute(
      `INSERT INTO site_stats (stat_date, wishes_count) VALUES (CURDATE(), 1)
       ON DUPLICATE KEY UPDATE wishes_count = wishes_count + 1`
    );

    res.status(201).json({
      message: 'Wish created successfully',
      wish: {
        id: result.insertId,
        name,
        content,
        category,
        is_anonymous,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// Todos Routes (Requires Authentication)
// ============================================

// GET /api/todos - Get user's todos
app.get('/api/todos', authenticateToken, async (req, res, next) => {
  try {
    const { completed, priority } = req.query;
    
    let query = 'SELECT id, title, description, completed, priority, due_date, created_at, updated_at FROM todos WHERE user_id = ?';
    const params = [req.user.id];

    if (completed !== undefined) {
      query += ' AND completed = ?';
      params.push(completed === 'true' ? 1 : 0);
    }

    if (priority && ['low', 'medium', 'high'].includes(priority)) {
      query += ' AND priority = ?';
      params.push(priority);
    }

    query += ' ORDER BY created_at DESC';

    const [todos] = await pool.execute(query, params);

    res.json({ todos });
  } catch (error) {
    next(error);
  }
});

// POST /api/todos - Create a new todo
app.post('/api/todos', authenticateToken, async (req, res, next) => {
  try {
    const { title, description, priority = 'medium', due_date } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ error: 'Priority must be "low", "medium", or "high"' });
    }

    const [result] = await pool.execute(
      'INSERT INTO todos (user_id, title, description, priority, due_date) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, title, description || null, priority, due_date || null]
    );

    // Update stats
    await pool.execute(
      `INSERT INTO site_stats (stat_date, todos_count) VALUES (CURDATE(), 1)
       ON DUPLICATE KEY UPDATE todos_count = todos_count + 1`
    );

    res.status(201).json({
      message: 'Todo created successfully',
      todo: {
        id: result.insertId,
        title,
        description,
        completed: false,
        priority,
        due_date,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/todos/:id - Update a todo
app.patch('/api/todos/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, completed, priority, due_date } = req.body;

    // Check ownership
    const [existing] = await pool.execute(
      'SELECT id FROM todos WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (completed !== undefined) {
      updates.push('completed = ?');
      params.push(completed ? 1 : 0);
    }
    if (priority !== undefined) {
      if (!['low', 'medium', 'high'].includes(priority)) {
        return res.status(400).json({ error: 'Priority must be "low", "medium", or "high"' });
      }
      updates.push('priority = ?');
      params.push(priority);
    }
    if (due_date !== undefined) {
      updates.push('due_date = ?');
      params.push(due_date);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);

    await pool.execute(
      `UPDATE todos SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Get updated todo
    const [updated] = await pool.execute(
      'SELECT id, title, description, completed, priority, due_date, created_at, updated_at FROM todos WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Todo updated successfully',
      todo: updated[0]
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/todos/:id - Delete a todo
app.delete('/api/todos/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check ownership
    const [existing] = await pool.execute(
      'SELECT id FROM todos WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    await pool.execute('DELETE FROM todos WHERE id = ?', [id]);

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// ============================================
// Timeline Routes
// ============================================

// GET /api/timeline - Get Christmas timeline events
app.get('/api/timeline', async (req, res, next) => {
  try {
    const [events] = await pool.execute(
      'SELECT id, title, event_date, meta, description FROM timeline_events ORDER BY sort_order ASC'
    );

    res.json({ events });
  } catch (error) {
    next(error);
  }
});

// ============================================
// Gallery Routes
// ============================================

// GET /api/gallery - Get gallery images
app.get('/api/gallery', async (req, res, next) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = 'SELECT id, image_url, thumbnail_url, label, description, category, created_at FROM gallery_images';
    const params = [];

    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [images] = await pool.execute(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM gallery_images';
    if (category) {
      countQuery += ' WHERE category = ?';
    }
    const [countResult] = await pool.execute(
      countQuery,
      category ? [category] : []
    );

    res.json({
      images,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/gallery - Upload image (requires authentication)
app.post('/api/gallery', authenticateToken, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const { label, description, category = 'general' } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`;

    const [result] = await pool.execute(
      'INSERT INTO gallery_images (user_id, image_url, thumbnail_url, label, description, category) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, imageUrl, imageUrl, label || null, description || null, category]
    );

    res.status(201).json({
      message: 'Image uploaded successfully',
      image: {
        id: result.insertId,
        image_url: imageUrl,
        thumbnail_url: imageUrl,
        label,
        description,
        category,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// Music Routes
// ============================================

// GET /api/music - Get playlist
app.get('/api/music', async (req, res, next) => {
  try {
    const [songs] = await pool.execute(
      'SELECT id, title, artist, tag, url, duration, play_count FROM music_playlist ORDER BY sort_order ASC'
    );

    res.json({ songs });
  } catch (error) {
    next(error);
  }
});

// POST /api/music/:id/play - Increment play count
app.post('/api/music/:id/play', async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.execute(
      'SELECT id FROM music_playlist WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Song not found' });
    }

    await pool.execute(
      'UPDATE music_playlist SET play_count = play_count + 1 WHERE id = ?',
      [id]
    );

    res.json({ message: 'Play count incremented' });
  } catch (error) {
    next(error);
  }
});

// ============================================
// Stats Routes
// ============================================

// GET /api/stats - Get site statistics
app.get('/api/stats', async (req, res, next) => {
  try {
    // Get today's stats
    const [todayStats] = await pool.execute(
      'SELECT visit_count, active_users, wishes_count, todos_count FROM site_stats WHERE stat_date = CURDATE()'
    );

    // Get total counts
    const [totalWishes] = await pool.execute('SELECT COUNT(*) as count FROM wishes');
    const [totalTodos] = await pool.execute('SELECT COUNT(*) as count FROM todos');
    const [totalUsers] = await pool.execute('SELECT COUNT(*) as count FROM users');

    const today = todayStats[0] || { visit_count: 0, active_users: 0, wishes_count: 0, todos_count: 0 };

    res.json({
      today: {
        visits: today.visit_count,
        activeUsers: today.active_users,
        newWishes: today.wishes_count,
        newTodos: today.todos_count
      },
      total: {
        wishes: totalWishes[0].count,
        todos: totalTodos[0].count,
        users: totalUsers[0].count
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/stats/visit - Increment visit count
app.post('/api/stats/visit', async (req, res, next) => {
  try {
    await pool.execute(
      `INSERT INTO site_stats (stat_date, visit_count) VALUES (CURDATE(), 1)
       ON DUPLICATE KEY UPDATE visit_count = visit_count + 1`
    );

    res.json({ message: 'Visit recorded' });
  } catch (error) {
    next(error);
  }
});

// ============================================
// Serve index.html for root route
// ============================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ============================================
// Error Handler
// ============================================
app.use(errorHandler);

// ============================================
// Start Server
// ============================================
app.listen(PORT, async () => {
  console.log(`🎄 Christmas Wonderland Server running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  await testConnection();
});

module.exports = app;
