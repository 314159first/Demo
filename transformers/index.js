/**
 * Christmas Wonderland - Data Transformers
 * Centralized data transformation utilities for input validation, sanitization, and output formatting
 */

/**
 * String transformers
 */
const stringTransformers = {
  // Trim and sanitize string input
  sanitize: (str) => {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  },

  // Truncate string to max length
  truncate: (str, maxLength) => {
    const sanitized = stringTransformers.sanitize(str);
    return sanitized.length > maxLength ? sanitized.substring(0, maxLength) : sanitized;
  },

  // Escape HTML to prevent XSS
  escapeHtml: (str) => {
    const sanitized = stringTransformers.sanitize(str);
    return sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};

/**
 * Number transformers
 */
const numberTransformers = {
  // Parse and validate integer
  toInt: (value, defaultValue = 0) => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  },

  // Parse and validate float
  toFloat: (value, defaultValue = 0.0) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  },

  // Clamp number between min and max
  clamp: (value, min, max) => {
    const num = typeof value === 'number' ? value : numberTransformers.toFloat(value);
    return Math.min(Math.max(num, min), max);
  }
};

/**
 * Date transformers
 */
const dateTransformers = {
  // Convert to ISO string, handling various input formats
  toISO: (date) => {
    if (!date) return null;
    try {
      const d = date instanceof Date ? date : new Date(date);
      return isNaN(d.getTime()) ? null : d.toISOString();
    } catch {
      return null;
    }
  },

  // Format date for display (using international format)
  toDisplayDate: (date, locale = 'en-US') => {
    if (!date) return null;
    try {
      const d = date instanceof Date ? date : new Date(date);
      return isNaN(d.getTime()) ? null : d.toLocaleDateString(locale);
    } catch {
      return null;
    }
  }
};

/**
 * Boolean transformers
 */
const booleanTransformers = {
  // Convert various truthy/falsy values to boolean
  toBool: (value) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      return lower === 'true' || lower === '1' || lower === 'yes';
    }
    return !!value;
  }
};

/**
 * Pagination transformers
 */
const paginationTransformers = {
  // Transform pagination parameters
  normalizePagination: (page, limit, maxLimit = 100) => {
    const normalizedPage = Math.max(1, numberTransformers.toInt(page, 1));
    const normalizedLimit = numberTransformers.clamp(
      numberTransformers.toInt(limit, 20),
      1,
      maxLimit
    );
    const offset = (normalizedPage - 1) * normalizedLimit;

    return {
      page: normalizedPage,
      limit: normalizedLimit,
      offset
    };
  },

  // Create pagination metadata
  createPaginationMeta: (page, limit, total) => {
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1
    };
  }
};

/**
 * Input transformers for API requests
 */
const inputTransformers = {
  // Transform user registration input
  userRegistration: (data) => {
    return {
      username: stringTransformers.truncate(data.username, 50),
      email: stringTransformers.truncate(data.email, 100).toLowerCase(),
      password: data.password // Don't transform password, let bcrypt handle it
    };
  },

  // Transform wish input
  wish: (data) => {
    return {
      name: stringTransformers.truncate(data.name, 100),
      content: stringTransformers.truncate(data.content, 1000),
      category: ['nice', 'naughty'].includes(data.category) ? data.category : 'nice',
      is_anonymous: booleanTransformers.toBool(data.is_anonymous)
    };
  },

  // Transform todo input
  todo: (data) => {
    const transformed = {
      title: stringTransformers.truncate(data.title, 255)
    };

    if (data.description !== undefined) {
      transformed.description = stringTransformers.truncate(data.description, 1000);
    }
    if (data.priority !== undefined) {
      transformed.priority = ['low', 'medium', 'high'].includes(data.priority) 
        ? data.priority 
        : 'medium';
    }
    if (data.due_date !== undefined) {
      transformed.due_date = data.due_date;
    }
    if (data.completed !== undefined) {
      transformed.completed = booleanTransformers.toBool(data.completed);
    }

    return transformed;
  },

  // Transform gallery image input
  galleryImage: (data) => {
    return {
      label: data.label ? stringTransformers.truncate(data.label, 100) : null,
      description: data.description ? stringTransformers.truncate(data.description, 500) : null,
      category: data.category ? stringTransformers.truncate(data.category, 50) : 'general'
    };
  }
};

/**
 * Output transformers for API responses
 */
const outputTransformers = {
  // Transform user data for API response (exclude sensitive fields)
  user: (userData) => {
    if (!userData) return null;
    return {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      avatar: userData.avatar || null,
      created_at: dateTransformers.toISO(userData.created_at)
    };
  },

  // Transform wish data for API response
  wish: (wishData) => {
    if (!wishData) return null;
    return {
      id: wishData.id,
      name: wishData.name,
      content: wishData.content,
      category: wishData.category,
      is_anonymous: booleanTransformers.toBool(wishData.is_anonymous),
      created_at: dateTransformers.toISO(wishData.created_at)
    };
  },

  // Transform todo data for API response
  todo: (todoData) => {
    if (!todoData) return null;
    return {
      id: todoData.id,
      title: todoData.title,
      description: todoData.description || null,
      completed: booleanTransformers.toBool(todoData.completed),
      priority: todoData.priority,
      due_date: todoData.due_date,
      created_at: dateTransformers.toISO(todoData.created_at),
      updated_at: dateTransformers.toISO(todoData.updated_at)
    };
  },

  // Transform timeline event data for API response
  timelineEvent: (eventData) => {
    if (!eventData) return null;
    return {
      id: eventData.id,
      title: eventData.title,
      event_date: eventData.event_date,
      meta: eventData.meta || null,
      description: eventData.description || null,
      created_at: dateTransformers.toISO(eventData.created_at)
    };
  },

  // Transform gallery image data for API response
  galleryImage: (imageData) => {
    if (!imageData) return null;
    return {
      id: imageData.id,
      image_url: imageData.image_url,
      thumbnail_url: imageData.thumbnail_url || imageData.image_url,
      label: imageData.label || null,
      description: imageData.description || null,
      category: imageData.category,
      created_at: dateTransformers.toISO(imageData.created_at)
    };
  },

  // Transform music data for API response
  music: (musicData) => {
    if (!musicData) return null;
    return {
      id: musicData.id,
      title: musicData.title,
      artist: musicData.artist || null,
      tag: musicData.tag || null,
      url: musicData.url || null,
      duration: musicData.duration || null,
      play_count: numberTransformers.toInt(musicData.play_count, 0),
      created_at: dateTransformers.toISO(musicData.created_at)
    };
  },

  // Transform array of data
  collection: (dataArray, transformer) => {
    if (!Array.isArray(dataArray)) return [];
    return dataArray.map(item => transformer(item));
  },

  // Create standardized success response
  success: (data, message = null) => {
    const response = { success: true };
    if (message) response.message = message;
    if (data !== undefined) response.data = data;
    return response;
  },

  // Create standardized error response
  error: (message, details = null) => {
    const response = { success: false, error: message };
    if (details) response.details = details;
    return response;
  },

  // Create paginated response
  paginated: (items, paginationMeta, transformer = null) => {
    return {
      success: true,
      data: transformer ? outputTransformers.collection(items, transformer) : items,
      pagination: paginationMeta
    };
  }
};

/**
 * Validation helpers
 */
const validators = {
  // Validate required fields
  required: (value, fieldName) => {
    if (value === undefined || value === null || value === '') {
      throw new Error(`${fieldName} is required`);
    }
    return true;
  },

  // Validate email format
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
    return true;
  },

  // Validate string length
  length: (str, min, max, fieldName) => {
    const len = str ? str.length : 0;
    if (len < min || len > max) {
      throw new Error(`${fieldName} must be between ${min} and ${max} characters`);
    }
    return true;
  },

  // Validate enum value
  enum: (value, allowedValues, fieldName) => {
    if (!allowedValues.includes(value)) {
      throw new Error(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
    }
    return true;
  }
};

module.exports = {
  string: stringTransformers,
  number: numberTransformers,
  date: dateTransformers,
  boolean: booleanTransformers,
  pagination: paginationTransformers,
  input: inputTransformers,
  output: outputTransformers,
  validators
};
