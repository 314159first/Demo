/**
 * Simple tests for transformer functions
 * Run with: node transformers/test.js
 */

const transformers = require('./index');

// Test counter
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.error(`✗ ${name}: ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

console.log('\n=== Testing String Transformers ===\n');

test('sanitize removes control characters', () => {
  const result = transformers.string.sanitize('hello\x00world\x1F');
  assert(result === 'helloworld', `Expected "helloworld", got "${result}"`);
});

test('sanitize trims whitespace', () => {
  const result = transformers.string.sanitize('  hello  ');
  assert(result === 'hello', `Expected "hello", got "${result}"`);
});

test('truncate limits string length', () => {
  const result = transformers.string.truncate('hello world', 5);
  assert(result === 'hello', `Expected "hello", got "${result}"`);
});

test('escapeHtml escapes special characters', () => {
  const result = transformers.string.escapeHtml('<script>alert("xss")</script>');
  assert(result.includes('&lt;script&gt;'), 'HTML should be escaped');
});

console.log('\n=== Testing Number Transformers ===\n');

test('toInt converts string to integer', () => {
  const result = transformers.number.toInt('42');
  assert(result === 42, `Expected 42, got ${result}`);
});

test('toInt returns default for invalid input', () => {
  const result = transformers.number.toInt('invalid', 10);
  assert(result === 10, `Expected 10, got ${result}`);
});

test('clamp restricts value to range', () => {
  const result = transformers.number.clamp(150, 1, 100);
  assert(result === 100, `Expected 100, got ${result}`);
});

console.log('\n=== Testing Boolean Transformers ===\n');

test('toBool converts truthy string to true', () => {
  assert(transformers.boolean.toBool('true') === true, 'Should be true');
  assert(transformers.boolean.toBool('1') === true, 'Should be true');
  assert(transformers.boolean.toBool('yes') === true, 'Should be true');
});

test('toBool converts falsy string to false', () => {
  assert(transformers.boolean.toBool('false') === false, 'Should be false');
  assert(transformers.boolean.toBool('0') === false, 'Should be false');
  assert(transformers.boolean.toBool('') === false, 'Should be false');
});

console.log('\n=== Testing Date Transformers ===\n');

test('toISO converts date to ISO string', () => {
  const date = new Date('2025-12-25');
  const result = transformers.date.toISO(date);
  assert(result !== null, 'Should return ISO string');
  assert(result.includes('2025-12-25'), 'Should contain the date');
});

test('toISO handles invalid date', () => {
  const result = transformers.date.toISO('invalid date');
  assert(result === null, 'Should return null for invalid date');
});

console.log('\n=== Testing Pagination Transformers ===\n');

test('normalizePagination creates valid pagination params', () => {
  const result = transformers.pagination.normalizePagination(2, 10);
  assert(result.page === 2, `Expected page 2, got ${result.page}`);
  assert(result.limit === 10, `Expected limit 10, got ${result.limit}`);
  assert(result.offset === 10, `Expected offset 10, got ${result.offset}`);
});

test('normalizePagination enforces max limit', () => {
  const result = transformers.pagination.normalizePagination(1, 200, 100);
  assert(result.limit === 100, `Expected limit 100, got ${result.limit}`);
});

test('createPaginationMeta generates correct metadata', () => {
  const result = transformers.pagination.createPaginationMeta(2, 10, 45);
  assert(result.page === 2, 'Page should be 2');
  assert(result.totalPages === 5, 'Total pages should be 5');
  assert(result.hasNextPage === true, 'Should have next page');
  assert(result.hasPreviousPage === true, 'Should have previous page');
});

console.log('\n=== Testing Input Transformers ===\n');

test('userRegistration transforms user data', () => {
  const result = transformers.input.userRegistration({
    username: '  testuser  ',
    email: 'TEST@EXAMPLE.COM',
    password: 'password123'
  });
  assert(result.username === 'testuser', 'Username should be trimmed');
  assert(result.email === 'test@example.com', 'Email should be lowercase');
  assert(result.password === 'password123', 'Password should be unchanged');
});

test('wish transforms wish data', () => {
  const result = transformers.input.wish({
    name: '  Santa  ',
    content: '  I want a gift  ',
    category: 'nice',
    is_anonymous: 'true'
  });
  assert(result.name === 'Santa', 'Name should be trimmed');
  assert(result.content === 'I want a gift', 'Content should be trimmed');
  assert(result.category === 'nice', 'Category should be valid');
  assert(result.is_anonymous === true, 'is_anonymous should be boolean');
});

test('todo transforms todo data', () => {
  const result = transformers.input.todo({
    title: '  Buy gifts  ',
    description: '  For family  ',
    priority: 'high',
    completed: '1'
  });
  assert(result.title === 'Buy gifts', 'Title should be trimmed');
  assert(result.description === 'For family', 'Description should be trimmed');
  assert(result.priority === 'high', 'Priority should be valid');
  assert(result.completed === true, 'Completed should be boolean');
});

console.log('\n=== Testing Output Transformers ===\n');

test('user transformer formats user data', () => {
  const result = transformers.output.user({
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password_hash: 'secret',
    created_at: new Date('2025-12-25')
  });
  assert(result.id === 1, 'ID should be included');
  assert(result.username === 'testuser', 'Username should be included');
  assert(result.password_hash === undefined, 'Password hash should be excluded');
  assert(result.created_at !== null, 'Created at should be ISO string');
});

test('collection transformer transforms arrays', () => {
  const data = [
    { id: 1, title: 'Task 1', completed: 0, created_at: new Date() },
    { id: 2, title: 'Task 2', completed: 1, created_at: new Date() }
  ];
  const result = transformers.output.collection(data, transformers.output.todo);
  assert(result.length === 2, 'Should have 2 items');
  assert(result[0].completed === false, 'First item completed should be false');
  assert(result[1].completed === true, 'Second item completed should be true');
});

test('success creates success response', () => {
  const result = transformers.output.success({ id: 1 }, 'Created successfully');
  assert(result.success === true, 'Should have success flag');
  assert(result.message === 'Created successfully', 'Should have message');
  assert(result.data.id === 1, 'Should have data');
});

test('error creates error response', () => {
  const result = transformers.output.error('Something went wrong', { code: 500 });
  assert(result.success === false, 'Should have success flag as false');
  assert(result.error === 'Something went wrong', 'Should have error message');
  assert(result.details.code === 500, 'Should have details');
});

console.log('\n=== Testing Validators ===\n');

test('validators.required throws for missing value', () => {
  try {
    transformers.validators.required('', 'username');
    assert(false, 'Should have thrown an error');
  } catch (error) {
    assert(error.message.includes('username'), 'Error should mention field name');
  }
});

test('validators.email validates email format', () => {
  try {
    transformers.validators.email('test@example.com');
    assert(true, 'Valid email should pass');
  } catch (error) {
    assert(false, 'Should not throw for valid email');
  }
});

test('validators.email throws for invalid email', () => {
  try {
    transformers.validators.email('invalid-email');
    assert(false, 'Should have thrown an error');
  } catch (error) {
    assert(error.message.includes('Invalid email'), 'Error should mention invalid email');
  }
});

test('validators.enum validates allowed values', () => {
  try {
    transformers.validators.enum('high', ['low', 'medium', 'high'], 'priority');
    assert(true, 'Valid enum should pass');
  } catch (error) {
    assert(false, 'Should not throw for valid enum value');
  }
});

test('validators.enum throws for invalid value', () => {
  try {
    transformers.validators.enum('invalid', ['low', 'medium', 'high'], 'priority');
    assert(false, 'Should have thrown an error');
  } catch (error) {
    assert(error.message.includes('priority'), 'Error should mention field name');
  }
});

console.log('\n=== Test Summary ===\n');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}\n`);

process.exit(failed > 0 ? 1 : 0);
