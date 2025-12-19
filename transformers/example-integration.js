/**
 * Example Integration of Transformers into Express Routes
 * This file demonstrates how to refactor existing routes to use transformers
 */

const express = require('express');
const { input, output, validators, pagination } = require('./index');

// Mock database pool for demonstration
const pool = {
  async execute(query, params) {
    // This is just for demonstration
    return [[], { insertId: 123 }];
  }
};

const app = express();
app.use(express.json());

// ============================================
// Example 1: User Registration with Transformers
// ============================================

app.post('/api/auth/register', async (req, res, next) => {
  try {
    // Step 1: Validate required fields
    validators.required(req.body.username, 'username');
    validators.required(req.body.email, 'email');
    validators.required(req.body.password, 'password');
    
    // Step 2: Validate formats and constraints
    validators.email(req.body.email);
    validators.length(req.body.username, 3, 50, 'username');
    validators.length(req.body.password, 6, 100, 'password');
    
    // Step 3: Transform input data
    const userData = input.userRegistration(req.body);
    // userData is now: { username: 'trimmed', email: 'lowercase@email.com', password: 'raw' }
    
    // Step 4: Check if user exists (business logic)
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [userData.username, userData.email]
    );
    
    if (existing.length > 0) {
      return res.status(409).json(
        output.error('Username or email already exists')
      );
    }
    
    // Step 5: Save to database (hash password first)
    const passwordHash = 'hashed_password'; // Use bcrypt in real code
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [userData.username, userData.email, passwordHash]
    );
    
    // Step 6: Transform output (excludes sensitive data)
    const user = output.user({
      id: result.insertId,
      username: userData.username,
      email: userData.email,
      created_at: new Date()
    });
    
    // Step 7: Return standardized success response
    res.status(201).json(
      output.success({ user, token: 'jwt_token' }, 'User registered successfully')
    );
  } catch (error) {
    // Validation errors from validators throw with descriptive messages
    res.status(400).json(output.error(error.message));
  }
});

// ============================================
// Example 2: Wishes with Pagination and Transformers
// ============================================

app.get('/api/wishes', async (req, res, next) => {
  try {
    // Step 1: Normalize pagination parameters
    const { page, limit, offset } = pagination.normalizePagination(
      req.query.page,
      req.query.limit,
      100 // max limit
    );
    
    // Step 2: Validate category if provided
    const category = req.query.category;
    if (category) {
      validators.enum(category, ['nice', 'naughty'], 'category');
    }
    
    // Step 3: Build query
    let query = 'SELECT id, name, content, category, is_anonymous, created_at FROM wishes';
    const params = [];
    
    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    // Step 4: Execute query
    const [wishes] = await pool.execute(query, params);
    
    // Step 5: Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM wishes';
    if (category) {
      countQuery += ' WHERE category = ?';
    }
    const [countResult] = await pool.execute(
      countQuery,
      category ? [category] : []
    );
    const total = countResult[0].total;
    
    // Step 6: Create pagination metadata
    const paginationMeta = pagination.createPaginationMeta(page, limit, total);
    
    // Step 7: Transform output and return paginated response
    res.json(output.paginated(wishes, paginationMeta, output.wish));
    // Returns:
    // {
    //   success: true,
    //   data: [...transformed wishes...],
    //   pagination: { page, limit, total, totalPages, hasNextPage, hasPreviousPage }
    // }
  } catch (error) {
    res.status(400).json(output.error(error.message));
  }
});

app.post('/api/wishes', async (req, res, next) => {
  try {
    // Step 1: Validate required fields
    validators.required(req.body.name, 'name');
    validators.required(req.body.content, 'content');
    
    // Step 2: Validate lengths
    validators.length(req.body.name, 1, 100, 'name');
    validators.length(req.body.content, 1, 1000, 'content');
    
    // Step 3: Transform input (handles category validation and boolean conversion)
    const wishData = input.wish(req.body);
    
    // Step 4: Save to database
    const [result] = await pool.execute(
      'INSERT INTO wishes (name, content, category, is_anonymous) VALUES (?, ?, ?, ?)',
      [wishData.name, wishData.content, wishData.category, wishData.is_anonymous ? 1 : 0]
    );
    
    // Step 5: Transform output
    const wish = output.wish({
      id: result.insertId,
      ...wishData,
      created_at: new Date()
    });
    
    // Step 6: Return success response
    res.status(201).json(output.success(wish, 'Wish created successfully'));
  } catch (error) {
    res.status(400).json(output.error(error.message));
  }
});

// ============================================
// Example 3: Todos with Transformers
// ============================================

app.get('/api/todos', async (req, res, next) => {
  try {
    // Assume req.user is set by auth middleware
    const userId = req.user.id;
    
    // Step 1: Build query with optional filters
    let query = 'SELECT * FROM todos WHERE user_id = ?';
    const params = [userId];
    
    // Optional: filter by completed status
    if (req.query.completed !== undefined) {
      const { boolean } = require('./index');
      const completed = boolean.toBool(req.query.completed);
      query += ' AND completed = ?';
      params.push(completed ? 1 : 0);
    }
    
    // Optional: filter by priority
    if (req.query.priority) {
      validators.enum(req.query.priority, ['low', 'medium', 'high'], 'priority');
      query += ' AND priority = ?';
      params.push(req.query.priority);
    }
    
    query += ' ORDER BY created_at DESC';
    
    // Step 2: Execute query
    const [todos] = await pool.execute(query, params);
    
    // Step 3: Transform collection
    const transformed = output.collection(todos, output.todo);
    
    // Step 4: Return success response
    res.json(output.success(transformed));
  } catch (error) {
    res.status(400).json(output.error(error.message));
  }
});

app.post('/api/todos', async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Step 1: Validate required fields
    validators.required(req.body.title, 'title');
    validators.length(req.body.title, 1, 255, 'title');
    
    // Step 2: Transform input
    const todoData = input.todo(req.body);
    
    // Step 3: Save to database
    const [result] = await pool.execute(
      'INSERT INTO todos (user_id, title, description, priority, due_date) VALUES (?, ?, ?, ?, ?)',
      [userId, todoData.title, todoData.description, todoData.priority, todoData.due_date]
    );
    
    // Step 4: Transform output
    const todo = output.todo({
      id: result.insertId,
      ...todoData,
      completed: false,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    // Step 5: Return success response
    res.status(201).json(output.success(todo, 'Todo created successfully'));
  } catch (error) {
    res.status(400).json(output.error(error.message));
  }
});

app.patch('/api/todos/:id', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const todoId = req.params.id;
    
    // Step 1: Check ownership
    const [existing] = await pool.execute(
      'SELECT id FROM todos WHERE id = ? AND user_id = ?',
      [todoId, userId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json(output.error('Todo not found'));
    }
    
    // Step 2: Transform partial update data
    const todoData = input.todo(req.body);
    
    // Step 3: Build dynamic update query
    const updates = [];
    const params = [];
    
    Object.entries(todoData).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        params.push(key === 'completed' ? (value ? 1 : 0) : value);
      }
    });
    
    if (updates.length === 0) {
      return res.status(400).json(output.error('No fields to update'));
    }
    
    params.push(todoId, userId);
    
    // Step 4: Execute update
    await pool.execute(
      `UPDATE todos SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
      params
    );
    
    // Step 5: Fetch updated record
    const [updated] = await pool.execute(
      'SELECT * FROM todos WHERE id = ?',
      [todoId]
    );
    
    // Step 6: Transform and return
    const todo = output.todo(updated[0]);
    res.json(output.success(todo, 'Todo updated successfully'));
  } catch (error) {
    res.status(400).json(output.error(error.message));
  }
});

// ============================================
// Example 4: Gallery with File Upload and Transformers
// ============================================

app.get('/api/gallery', async (req, res, next) => {
  try {
    // Step 1: Normalize pagination
    const { page, limit, offset } = pagination.normalizePagination(
      req.query.page,
      req.query.limit
    );
    
    // Step 2: Optional category filter
    const category = req.query.category;
    let query = 'SELECT * FROM gallery_images';
    const params = [];
    
    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    // Step 3: Execute query
    const [images] = await pool.execute(query, params);
    
    // Step 4: Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM gallery_images';
    if (category) {
      countQuery += ' WHERE category = ?';
    }
    const [countResult] = await pool.execute(
      countQuery,
      category ? [category] : []
    );
    const total = countResult[0].total;
    
    // Step 5: Create response
    const paginationMeta = pagination.createPaginationMeta(page, limit, total);
    res.json(output.paginated(images, paginationMeta, output.galleryImage));
  } catch (error) {
    res.status(400).json(output.error(error.message));
  }
});

// ============================================
// Key Benefits Demonstrated:
// ============================================
// 1. Consistent validation across all endpoints
// 2. Automatic data sanitization and type conversion
// 3. Standardized error and success responses
// 4. Pagination handling in one place
// 5. Clean separation of concerns
// 6. Less repetitive code
// 7. Easier to test and maintain

console.log('Example integration file loaded. This demonstrates how to use transformers in routes.');

module.exports = app;
