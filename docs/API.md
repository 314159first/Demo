# Christmas Wonderland API Documentation

## Overview

This document describes the RESTful API for the Christmas Wonderland application.

**Base URL:** `http://localhost:3000/api`

**Content-Type:** `application/json`

**Authentication:** JWT Bearer Token (where required)

---

## Authentication

### Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "username": "santa",
  "email": "santa@northpole.com",
  "password": "christmas123"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "santa",
    "email": "santa@northpole.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `400` - Missing required fields or password too short
- `409` - Username or email already exists

---

### Login

Authenticate an existing user.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "username": "santa",
  "password": "christmas123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "santa",
    "email": "santa@northpole.com",
    "avatar": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `400` - Missing credentials
- `401` - Invalid credentials

---

## Wishes (心愿墙)

### Get All Wishes

Retrieve all wishes with optional filtering.

**Endpoint:** `GET /api/wishes`

**Query Parameters:**
| Parameter | Type   | Description                      |
|-----------|--------|----------------------------------|
| category  | string | Filter by 'nice' or 'naughty'   |
| page      | number | Page number (default: 1)         |
| limit     | number | Items per page (default: 20)     |

**Response (200 OK):**
```json
{
  "wishes": [
    {
      "id": 1,
      "name": "小明",
      "content": "希望世界和平",
      "category": "nice",
      "is_anonymous": false,
      "created_at": "2025-12-20T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### Create Wish

Create a new wish. Authentication is optional.

**Endpoint:** `POST /api/wishes`

**Request Body:**
```json
{
  "name": "小明",
  "content": "希望明年一切顺利",
  "category": "nice",
  "is_anonymous": false
}
```

**Response (201 Created):**
```json
{
  "message": "Wish created successfully",
  "wish": {
    "id": 2,
    "name": "小明",
    "content": "希望明年一切顺利",
    "category": "nice",
    "is_anonymous": false,
    "created_at": "2025-12-20T11:00:00.000Z"
  }
}
```

---

## Todos (待办事项)

> **🔒 Authentication Required** - All todo endpoints require a valid JWT token.

### Get User Todos

Retrieve todos for the authenticated user.

**Endpoint:** `GET /api/todos`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter  | Type    | Description                         |
|------------|---------|-------------------------------------|
| completed  | boolean | Filter by completion status         |
| priority   | string  | Filter by 'low', 'medium', or 'high'|

**Response (200 OK):**
```json
{
  "todos": [
    {
      "id": 1,
      "title": "Buy Christmas gifts",
      "description": "For family and friends",
      "completed": false,
      "priority": "high",
      "due_date": "2025-12-24",
      "created_at": "2025-12-01T10:00:00.000Z",
      "updated_at": "2025-12-01T10:00:00.000Z"
    }
  ]
}
```

---

### Create Todo

Create a new todo item.

**Endpoint:** `POST /api/todos`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Decorate Christmas tree",
  "description": "Add lights and ornaments",
  "priority": "medium",
  "due_date": "2025-12-15"
}
```

**Response (201 Created):**
```json
{
  "message": "Todo created successfully",
  "todo": {
    "id": 2,
    "title": "Decorate Christmas tree",
    "description": "Add lights and ornaments",
    "completed": false,
    "priority": "medium",
    "due_date": "2025-12-15",
    "created_at": "2025-12-01T12:00:00.000Z"
  }
}
```

---

### Update Todo

Update an existing todo.

**Endpoint:** `PATCH /api/todos/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:** (all fields optional)
```json
{
  "title": "Updated title",
  "completed": true,
  "priority": "low"
}
```

**Response (200 OK):**
```json
{
  "message": "Todo updated successfully",
  "todo": {
    "id": 1,
    "title": "Updated title",
    "completed": true,
    "priority": "low",
    "...": "..."
  }
}
```

---

### Delete Todo

Delete a todo item.

**Endpoint:** `DELETE /api/todos/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Todo deleted successfully"
}
```

---

## Timeline (时间线)

### Get Timeline Events

Retrieve all Christmas timeline events.

**Endpoint:** `GET /api/timeline`

**Response (200 OK):**
```json
{
  "events": [
    {
      "id": 1,
      "title": "12 月上旬 · 营造氛围",
      "event_date": "12月上旬",
      "meta": "布置房间 · 点亮圣诞树 · 选好圣诞歌单",
      "description": "可以先从换个桌面、挂彩灯、摆个小树开始..."
    }
  ]
}
```

---

## Gallery (图片画廊)

### Get Gallery Images

Retrieve gallery images with optional filtering.

**Endpoint:** `GET /api/gallery`

**Query Parameters:**
| Parameter | Type   | Description                    |
|-----------|--------|--------------------------------|
| category  | string | Filter by category             |
| page      | number | Page number (default: 1)       |
| limit     | number | Items per page (default: 20)   |

**Response (200 OK):**
```json
{
  "images": [
    {
      "id": 1,
      "image_url": "https://...",
      "thumbnail_url": "https://...",
      "label": "温暖客厅",
      "description": null,
      "category": "decoration",
      "created_at": "2025-12-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 6,
    "totalPages": 1
  }
}
```

---

### Upload Image

Upload a new image to the gallery.

**Endpoint:** `POST /api/gallery`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
| Field       | Type   | Required | Description              |
|-------------|--------|----------|--------------------------|
| image       | file   | Yes      | Image file               |
| label       | string | No       | Image label              |
| description | string | No       | Image description        |
| category    | string | No       | Category (default: 'general') |

**Response (201 Created):**
```json
{
  "message": "Image uploaded successfully",
  "image": {
    "id": 7,
    "image_url": "/uploads/image-1703085600000-123456789.jpg",
    "thumbnail_url": "/uploads/image-1703085600000-123456789.jpg",
    "label": "My Christmas Tree",
    "description": "Decorated yesterday",
    "category": "tree",
    "created_at": "2025-12-20T15:00:00.000Z"
  }
}
```

---

## Music (音乐播放列表)

### Get Playlist

Retrieve the music playlist.

**Endpoint:** `GET /api/music`

**Response (200 OK):**
```json
{
  "songs": [
    {
      "id": 1,
      "title": "Jingle Bells",
      "artist": "Various Artists",
      "tag": "经典 · 欢快",
      "url": "",
      "duration": null,
      "play_count": 42
    }
  ]
}
```

---

### Record Play

Increment the play count for a song.

**Endpoint:** `POST /api/music/:id/play`

**Response (200 OK):**
```json
{
  "message": "Play count incremented"
}
```

---

## Statistics (网站统计)

### Get Site Stats

Retrieve site statistics.

**Endpoint:** `GET /api/stats`

**Response (200 OK):**
```json
{
  "today": {
    "visits": 150,
    "activeUsers": 25,
    "newWishes": 10,
    "newTodos": 5
  },
  "total": {
    "wishes": 500,
    "todos": 200,
    "users": 50
  }
}
```

---

### Record Visit

Record a page visit.

**Endpoint:** `POST /api/stats/visit`

**Response (200 OK):**
```json
{
  "message": "Visit recorded"
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes

| Status | Description                    |
|--------|--------------------------------|
| 200    | Success                        |
| 201    | Created                        |
| 400    | Bad Request (validation error) |
| 401    | Unauthorized (no/invalid token)|
| 403    | Forbidden (token expired)      |
| 404    | Not Found                      |
| 409    | Conflict (duplicate entry)     |
| 500    | Internal Server Error          |

---

## Rate Limiting

Rate limiting is implemented to protect the API from abuse:

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| General API  | 100 requests | 15 minutes |
| Authentication | 10 requests | 15 minutes |

When rate limit is exceeded, you'll receive a `429 Too Many Requests` response:

```json
{
  "error": "Too many requests, please try again later."
}
```

---

## CORS

Cross-Origin Resource Sharing (CORS) is enabled for all origins. For production, configure allowed origins in the server settings.
