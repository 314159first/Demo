# Transformers Module

A comprehensive data transformation library for the Christmas Wonderland application. This module provides utilities for input validation, sanitization, and output formatting.

## Features

- **String Transformers**: Sanitize, truncate, and escape HTML
- **Number Transformers**: Parse, validate, and clamp numeric values
- **Date Transformers**: Convert and format dates
- **Boolean Transformers**: Convert various values to boolean
- **Pagination Transformers**: Normalize pagination parameters
- **Input Transformers**: Validate and sanitize API request data
- **Output Transformers**: Format API response data
- **Validators**: Common validation helpers

## Installation

The transformers module is already included in this project. Simply require it:

```javascript
const transformers = require('./transformers');
```

## Usage Examples

### String Transformers

```javascript
const { string } = require('./transformers');

// Sanitize user input
const clean = string.sanitize('  hello\x00world  '); // 'helloworld'

// Truncate long strings
const short = string.truncate('Very long text...', 10); // 'Very long '

// Escape HTML to prevent XSS
const safe = string.escapeHtml('<script>alert("xss")</script>');
// '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
```

### Number Transformers

```javascript
const { number } = require('./transformers');

// Parse integers safely
const page = number.toInt(req.query.page, 1); // Default to 1

// Clamp values to valid range
const limit = number.clamp(req.query.limit, 1, 100); // Between 1 and 100
```

### Pagination Transformers

```javascript
const { pagination } = require('./transformers');

// Normalize pagination parameters
const { page, limit, offset } = pagination.normalizePagination(
  req.query.page,
  req.query.limit
);

// Create pagination metadata
const meta = pagination.createPaginationMeta(page, limit, totalCount);
// {
//   page: 1,
//   limit: 20,
//   total: 100,
//   totalPages: 5,
//   hasNextPage: true,
//   hasPreviousPage: false
// }
```

### Input Transformers

```javascript
const { input, validators } = require('./transformers');

// Transform and validate user registration
app.post('/api/auth/register', async (req, res) => {
  try {
    // Validate required fields
    validators.required(req.body.username, 'username');
    validators.required(req.body.email, 'email');
    validators.required(req.body.password, 'password');
    
    // Validate email format
    validators.email(req.body.email);
    
    // Validate password length
    validators.length(req.body.password, 6, 100, 'password');
    
    // Transform input
    const userData = input.userRegistration(req.body);
    
    // userData is now clean, trimmed, and normalized
    // { username: 'clean', email: 'lower@case.com', password: 'raw' }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// Transform wish data
const wishData = input.wish({
  name: '  Santa  ',
  content: '  I want gifts  ',
  category: 'nice',
  is_anonymous: 'true'
});
// { name: 'Santa', content: 'I want gifts', category: 'nice', is_anonymous: true }
```

### Output Transformers

```javascript
const { output } = require('./transformers');

// Transform single record
app.get('/api/users/:id', async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.params.id]);
  const user = output.user(rows[0]);
  res.json(user); // Password hash is automatically excluded
});

// Transform collection
app.get('/api/todos', async (req, res) => {
  const [todos] = await pool.execute('SELECT * FROM todos WHERE user_id = ?', [req.user.id]);
  const transformed = output.collection(todos, output.todo);
  res.json({ todos: transformed });
});

// Create standardized success response
res.json(output.success({ id: 123 }, 'Todo created successfully'));
// { success: true, message: 'Todo created successfully', data: { id: 123 } }

// Create standardized error response
res.status(400).json(output.error('Invalid input', { field: 'email' }));
// { success: false, error: 'Invalid input', details: { field: 'email' } }

// Create paginated response
const { page, limit, offset } = pagination.normalizePagination(req.query.page, req.query.limit);
const [items] = await pool.execute('SELECT * FROM wishes LIMIT ? OFFSET ?', [limit, offset]);
const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM wishes');
const total = countResult[0].total;

res.json(output.paginated(
  items,
  pagination.createPaginationMeta(page, limit, total),
  output.wish
));
```

### Validators

```javascript
const { validators } = require('./transformers');

try {
  // Validate required field
  validators.required(req.body.title, 'title');
  
  // Validate email format
  validators.email(req.body.email);
  
  // Validate string length
  validators.length(req.body.username, 3, 50, 'username');
  
  // Validate enum value
  validators.enum(req.body.priority, ['low', 'medium', 'high'], 'priority');
} catch (error) {
  return res.status(400).json({ error: error.message });
}
```

## Integration Example

Here's a complete example showing how to refactor an existing endpoint:

### Before (without transformers):

```javascript
app.post('/api/wishes', async (req, res) => {
  try {
    const { name, content, category = 'nice', is_anonymous = false } = req.body;

    if (!name || !content) {
      return res.status(400).json({ error: 'Name and content are required' });
    }

    if (!['nice', 'naughty'].includes(category)) {
      return res.status(400).json({ error: 'Category must be "nice" or "naughty"' });
    }

    const [result] = await pool.execute(
      'INSERT INTO wishes (name, content, category, is_anonymous) VALUES (?, ?, ?, ?)',
      [name.trim(), content.trim(), category, is_anonymous ? 1 : 0]
    );

    res.status(201).json({
      message: 'Wish created successfully',
      wish: {
        id: result.insertId,
        name: name.trim(),
        content: content.trim(),
        category,
        is_anonymous,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### After (with transformers):

```javascript
const { input, output, validators } = require('./transformers');

app.post('/api/wishes', async (req, res) => {
  try {
    // Validate
    validators.required(req.body.name, 'name');
    validators.required(req.body.content, 'content');
    
    // Transform input
    const wishData = input.wish(req.body);

    // Save to database
    const [result] = await pool.execute(
      'INSERT INTO wishes (name, content, category, is_anonymous) VALUES (?, ?, ?, ?)',
      [wishData.name, wishData.content, wishData.category, wishData.is_anonymous ? 1 : 0]
    );

    // Transform output
    const wish = output.wish({
      id: result.insertId,
      ...wishData,
      created_at: new Date()
    });

    res.status(201).json(output.success(wish, 'Wish created successfully'));
  } catch (error) {
    res.status(400).json(output.error(error.message));
  }
});
```

## Benefits

1. **Consistency**: All data follows the same transformation rules
2. **Security**: Automatic sanitization and HTML escaping
3. **Validation**: Centralized validation logic
4. **Maintainability**: Easy to update transformation rules in one place
5. **Type Safety**: Consistent type conversion (strings to numbers, booleans, etc.)
6. **Clean Code**: Less repetitive validation code in route handlers

## API Reference

### String Transformers

- `sanitize(str)`: Remove control characters and trim whitespace
- `truncate(str, maxLength)`: Limit string to maximum length
- `escapeHtml(str)`: Escape HTML special characters

### Number Transformers

- `toInt(value, defaultValue)`: Parse integer with default fallback
- `toFloat(value, defaultValue)`: Parse float with default fallback
- `clamp(value, min, max)`: Restrict value to range

### Date Transformers

- `toISO(date)`: Convert to ISO 8601 string
- `toDisplayDate(date)`: Format for display

### Boolean Transformers

- `toBool(value)`: Convert to boolean

### Pagination Transformers

- `normalizePagination(page, limit, maxLimit)`: Normalize pagination params
- `createPaginationMeta(page, limit, total)`: Create pagination metadata

### Input Transformers

- `userRegistration(data)`: Transform user registration data
- `wish(data)`: Transform wish data
- `todo(data)`: Transform todo data
- `galleryImage(data)`: Transform gallery image data

### Output Transformers

- `user(userData)`: Transform user for response
- `wish(wishData)`: Transform wish for response
- `todo(todoData)`: Transform todo for response
- `timelineEvent(eventData)`: Transform timeline event for response
- `galleryImage(imageData)`: Transform gallery image for response
- `music(musicData)`: Transform music for response
- `collection(dataArray, transformer)`: Transform array of items
- `success(data, message)`: Create success response
- `error(message, details)`: Create error response
- `paginated(items, paginationMeta, transformer)`: Create paginated response

### Validators

- `required(value, fieldName)`: Validate required field
- `email(email)`: Validate email format
- `length(str, min, max, fieldName)`: Validate string length
- `enum(value, allowedValues, fieldName)`: Validate enum value

## Testing

Run the test suite:

```bash
node transformers/test.js
```

All 26 tests should pass.

## License

Part of the Christmas Wonderland project - MIT License
