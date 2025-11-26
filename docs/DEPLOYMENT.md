# Deployment Guide

This guide explains how to deploy the Christmas Wonderland application.

## Prerequisites

### System Requirements

- **Node.js:** v16.0.0 or higher
- **MySQL:** v5.7 or higher (or MariaDB 10.2+)
- **npm:** v7.0.0 or higher

### Optional

- **Docker** (for containerized deployment)
- **nginx** (for reverse proxy)

---

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/christmas-wonderland.git
cd christmas-wonderland
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and update the values:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Server Configuration
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_secure_password
DB_NAME=christmas_wonderland

# JWT Configuration (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=your-unique-secure-secret-key-at-least-32-chars

# File Upload Configuration (in bytes)
MAX_FILE_SIZE=5242880
```

### 4. Initialize the Database

#### Option A: Using MySQL CLI

```bash
mysql -u root -p < database/schema.sql
```

#### Option B: Using MySQL Workbench or phpMyAdmin

1. Connect to your MySQL server
2. Create a new database named `christmas_wonderland`
3. Import the `database/schema.sql` file

#### Option C: Using npm script

```bash
npm run init-db
```
(You'll be prompted for your MySQL password)

### 5. Verify Installation

Test the database connection:

```bash
node -e "require('dotenv').config(); const mysql = require('mysql2/promise'); mysql.createConnection({host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME}).then(c => { console.log('✅ Database connected!'); c.end(); }).catch(e => console.log('❌ Error:', e.message));"
```

---

## Starting the Server

### Development Mode

With hot-reload using nodemon:

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start at `http://localhost:3000` (or your configured PORT).

---

## Production Deployment

### Using PM2 (Recommended)

PM2 is a production process manager for Node.js applications.

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start server.js --name christmas-wonderland

# Enable startup script (auto-restart on reboot)
pm2 startup
pm2 save

# View logs
pm2 logs christmas-wonderland

# Monitor
pm2 monit
```

### Using Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

Build and run:

```bash
docker build -t christmas-wonderland .
docker run -d -p 3000:3000 --env-file .env christmas-wonderland
```

### Using nginx as Reverse Proxy

Example nginx configuration:

```nginx
server {
    listen 80;
    server_name christmas.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location /uploads/ {
        alias /path/to/christmas-wonderland/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## Security Considerations

### Production Checklist

- [ ] Change `JWT_SECRET` to a strong, unique value
- [ ] Use HTTPS in production (SSL/TLS certificate)
- [ ] Set appropriate CORS origins
- [ ] Use a non-root database user with limited privileges
- [ ] Enable MySQL connection encryption
- [ ] Set up rate limiting
- [ ] Configure firewall rules
- [ ] Regular security updates

### Environment Variables Security

- Never commit `.env` file to version control
- Use environment variable management in cloud platforms
- Consider using secrets management tools (Vault, AWS Secrets Manager)

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed

**Error:** `ER_ACCESS_DENIED_ERROR`

**Solution:** Check your MySQL username and password in `.env`

```bash
# Test MySQL connection manually
mysql -u root -p -e "SELECT 1;"
```

#### 2. Port Already in Use

**Error:** `EADDRINUSE: address already in use`

**Solution:** Change the PORT in `.env` or kill the existing process:

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

#### 3. Module Not Found

**Error:** `Cannot find module 'xxx'`

**Solution:** Reinstall dependencies:

```bash
rm -rf node_modules
npm install
```

#### 4. Permission Denied for Uploads

**Error:** `EACCES: permission denied`

**Solution:** Fix permissions on uploads directory:

```bash
chmod 755 public/uploads
```

#### 5. JWT Token Invalid

**Error:** `JsonWebTokenError: invalid signature`

**Solution:** Ensure `JWT_SECRET` is the same value that was used to generate tokens. If you changed it, users will need to log in again.

---

## Monitoring & Logging

### Application Logs

Logs are output to stdout. For production, consider:

```bash
# Redirect to file
node server.js >> app.log 2>&1

# Or use PM2 logging
pm2 logs christmas-wonderland --lines 100
```

### Health Check Endpoint

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2025-12-25T00:00:00.000Z"}
```

---

## Backup & Recovery

### Database Backup

```bash
# Create backup
mysqldump -u root -p christmas_wonderland > backup_$(date +%Y%m%d).sql

# Restore from backup
mysql -u root -p christmas_wonderland < backup_20251225.sql
```

### Uploaded Files Backup

```bash
# Backup uploads directory
tar -czvf uploads_backup_$(date +%Y%m%d).tar.gz public/uploads/
```

---

## Support

If you encounter issues not covered here, please:

1. Check the [GitHub Issues](https://github.com/your-username/christmas-wonderland/issues)
2. Create a new issue with detailed information
3. Include error logs and environment details

---

🎄 **Merry Christmas and Happy Deploying!** 🎅
