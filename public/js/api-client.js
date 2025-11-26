/**
 * Christmas Wonderland - API Client
 * Frontend API integration layer
 */

const API = (() => {
  // Configuration
  const BASE_URL = window.location.origin + '/api';
  const TOKEN_KEY = 'christmas-auth-token';
  const USER_KEY = 'christmas-user';

  // ============================================
  // Token Management
  // ============================================
  const token = {
    get: () => localStorage.getItem(TOKEN_KEY),
    set: (value) => localStorage.setItem(TOKEN_KEY, value),
    remove: () => localStorage.removeItem(TOKEN_KEY),
    exists: () => !!localStorage.getItem(TOKEN_KEY)
  };

  const user = {
    get: () => {
      try {
        const data = localStorage.getItem(USER_KEY);
        return data ? JSON.parse(data) : null;
      } catch {
        return null;
      }
    },
    set: (value) => localStorage.setItem(USER_KEY, JSON.stringify(value)),
    remove: () => localStorage.removeItem(USER_KEY)
  };

  // ============================================
  // Base Request Function
  // ============================================
  async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Add authorization header if token exists
    const authToken = token.get();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Remove Content-Type for FormData
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        body: options.body instanceof FormData 
          ? options.body 
          : options.body ? JSON.stringify(options.body) : undefined
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error.message);
      throw error;
    }
  }

  // ============================================
  // Authentication API
  // ============================================
  const authAPI = {
    async register(username, email, password) {
      const data = await request('/auth/register', {
        method: 'POST',
        body: { username, email, password }
      });
      if (data.token) {
        token.set(data.token);
        user.set(data.user);
      }
      return data;
    },

    async login(username, password) {
      const data = await request('/auth/login', {
        method: 'POST',
        body: { username, password }
      });
      if (data.token) {
        token.set(data.token);
        user.set(data.user);
      }
      return data;
    },

    logout() {
      token.remove();
      user.remove();
    },

    isLoggedIn() {
      return token.exists();
    },

    getCurrentUser() {
      return user.get();
    }
  };

  // ============================================
  // Wishes API
  // ============================================
  const wishAPI = {
    async getAll(options = {}) {
      const params = new URLSearchParams();
      if (options.category) params.append('category', options.category);
      if (options.page) params.append('page', options.page);
      if (options.limit) params.append('limit', options.limit);
      
      const query = params.toString();
      return request(`/wishes${query ? '?' + query : ''}`);
    },

    async create(wishData) {
      return request('/wishes', {
        method: 'POST',
        body: wishData
      });
    }
  };

  // ============================================
  // Todos API
  // ============================================
  const todoAPI = {
    async getAll(options = {}) {
      const params = new URLSearchParams();
      if (options.completed !== undefined) params.append('completed', options.completed);
      if (options.priority) params.append('priority', options.priority);
      
      const query = params.toString();
      return request(`/todos${query ? '?' + query : ''}`);
    },

    async create(todoData) {
      return request('/todos', {
        method: 'POST',
        body: todoData
      });
    },

    async update(id, updates) {
      return request(`/todos/${id}`, {
        method: 'PATCH',
        body: updates
      });
    },

    async delete(id) {
      return request(`/todos/${id}`, {
        method: 'DELETE'
      });
    },

    async toggleComplete(id, completed) {
      return this.update(id, { completed });
    }
  };

  // ============================================
  // Timeline API
  // ============================================
  const timelineAPI = {
    async getAll() {
      return request('/timeline');
    }
  };

  // ============================================
  // Gallery API
  // ============================================
  const galleryAPI = {
    async getAll(options = {}) {
      const params = new URLSearchParams();
      if (options.category) params.append('category', options.category);
      if (options.page) params.append('page', options.page);
      if (options.limit) params.append('limit', options.limit);
      
      const query = params.toString();
      return request(`/gallery${query ? '?' + query : ''}`);
    },

    async upload(file, metadata = {}) {
      const formData = new FormData();
      formData.append('image', file);
      if (metadata.label) formData.append('label', metadata.label);
      if (metadata.description) formData.append('description', metadata.description);
      if (metadata.category) formData.append('category', metadata.category);

      return request('/gallery', {
        method: 'POST',
        body: formData
      });
    }
  };

  // ============================================
  // Music API
  // ============================================
  const musicAPI = {
    async getPlaylist() {
      return request('/music');
    },

    async recordPlay(songId) {
      return request(`/music/${songId}/play`, {
        method: 'POST'
      });
    }
  };

  // ============================================
  // Stats API
  // ============================================
  const statsAPI = {
    async get() {
      return request('/stats');
    },

    async recordVisit() {
      return request('/stats/visit', {
        method: 'POST'
      });
    }
  };

  // ============================================
  // UI Helper Functions
  // ============================================
  
  // Render wish list
  function renderWishes(wishes, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    if (!wishes || wishes.length === 0) {
      container.innerHTML = '<div class="empty-message">还没有心愿，快来写下第一个吧 ✨</div>';
      return;
    }

    container.innerHTML = wishes.map(wish => `
      <div class="wish-card" data-id="${wish.id}">
        <div class="wish-header">
          <div class="wish-name">${escapeHtml(wish.name)}</div>
          <div class="wish-badge ${wish.category === 'naughty' ? 'naughty' : ''}">
            ${wish.category === 'naughty' ? '调皮鬼 😈' : '乖孩子 😇'}
          </div>
        </div>
        <div class="wish-text">${escapeHtml(wish.content)}</div>
        <div class="wish-time">${formatDate(wish.created_at)}</div>
      </div>
    `).join('');
  }

  // Render todo list
  function renderTodos(todos, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    if (!todos || todos.length === 0) {
      container.innerHTML = '<div class="empty-message">目前还没有任务，先给自己安排一个小目标吧 🎯</div>';
      return;
    }

    container.innerHTML = todos.map(todo => `
      <div class="todo-item ${todo.completed ? 'done' : ''}" data-id="${todo.id}">
        <input type="checkbox" ${todo.completed ? 'checked' : ''} data-action="toggle">
        <div style="flex: 1">${escapeHtml(todo.title)}</div>
        <button data-action="delete">删除</button>
      </div>
    `).join('');
  }

  // Format date
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Show notification
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      background: ${type === 'error' ? '#ff4b5c' : type === 'success' ? '#2ecc71' : '#3498db'};
      color: white;
      font-size: 14px;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // ============================================
  // Initialize
  // ============================================
  async function init() {
    // Record visit on page load
    try {
      await statsAPI.recordVisit();
    } catch (e) {
      // Silently fail for stats
    }
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ============================================
  // Public API
  // ============================================
  return {
    auth: authAPI,
    wishes: wishAPI,
    todos: todoAPI,
    timeline: timelineAPI,
    gallery: galleryAPI,
    music: musicAPI,
    stats: statsAPI,
    ui: {
      renderWishes,
      renderTodos,
      showNotification,
      formatDate,
      escapeHtml
    },
    token,
    user
  };
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API;
}
