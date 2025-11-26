-- Christmas Wonderland Database Schema
-- MySQL Database Schema with UTF-8 encoding

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS christmas_wonderland
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE christmas_wonderland;

-- ============================================
-- 1. Users Table (用户表)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  avatar VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. Wishes Table (心愿墙表)
-- ============================================
CREATE TABLE IF NOT EXISTS wishes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  name VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  category ENUM('nice', 'naughty') DEFAULT 'nice',
  is_anonymous TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_category (category),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. Todos Table (待办事项表)
-- ============================================
CREATE TABLE IF NOT EXISTS todos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  completed TINYINT(1) DEFAULT 0,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  due_date DATE DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_completed (completed),
  INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. Timeline Events Table (时间线事件表)
-- ============================================
CREATE TABLE IF NOT EXISTS timeline_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  event_date VARCHAR(50) NOT NULL,
  meta VARCHAR(255) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. Gallery Images Table (图片画廊表)
-- ============================================
CREATE TABLE IF NOT EXISTS gallery_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  image_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500) DEFAULT NULL,
  label VARCHAR(100) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  category VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_category (category),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. Music Playlist Table (音乐播放列表表)
-- ============================================
CREATE TABLE IF NOT EXISTS music_playlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) DEFAULT NULL,
  tag VARCHAR(100) DEFAULT NULL,
  url VARCHAR(500) DEFAULT NULL,
  duration INT DEFAULT NULL COMMENT 'Duration in seconds',
  play_count INT DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sort_order (sort_order),
  INDEX idx_play_count (play_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. Site Stats Table (网站统计表)
-- ============================================
CREATE TABLE IF NOT EXISTS site_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stat_date DATE NOT NULL UNIQUE,
  visit_count INT DEFAULT 0,
  active_users INT DEFAULT 0,
  wishes_count INT DEFAULT 0,
  todos_count INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_stat_date (stat_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Insert Sample Data
-- ============================================

-- Timeline Events (圣诞活动日程)
INSERT INTO timeline_events (title, event_date, meta, description, sort_order) VALUES
('12 月上旬 · 营造氛围', '12月上旬', '布置房间 · 点亮圣诞树 · 选好圣诞歌单', '可以先从换个桌面、挂彩灯、摆个小树开始，慢慢让生活进入圣诞模式。', 1),
('12 月中旬 · 准备礼物', '12月中旬', '为自己 & 为重要的人准备一些小惊喜', '不一定要多贵重，一封手写卡片、一张照片、有记忆的物件，往往更打动人。', 2),
('12 月 24 日 · 平安夜', '12月24日', '夜宵 · 电影 · 倒数计时', '可以安排一场温馨的电影夜，搭配热可可，和朋友/家人/自己好好放松。', 3),
('12 月 25 日 · 圣诞节', '12月25日', '拆礼物 · 拍照片 · 记录一年最后的温暖', '别忘了拍几张"今年的圣诞照"，未来翻到时，会觉得今天真好。', 4);

-- Music Playlist (音乐播放列表)
INSERT INTO music_playlist (title, artist, tag, url, sort_order) VALUES
('Jingle Bells', 'Various Artists', '经典 · 欢快', '', 1),
('Silent Night', 'Various Artists', '安静 · 温柔', '', 2),
('We Wish You a Merry Christmas', 'Various Artists', '合唱 · 氛围', '', 3),
('Last Christmas', 'Wham!', '流行 · 怀旧', '', 4),
('All I Want for Christmas Is You', 'Mariah Carey', '流行 · 经典', '', 5);

-- Gallery Images (画廊示例图片)
INSERT INTO gallery_images (image_url, thumbnail_url, label, category) VALUES
('https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=600&q=60', '温暖客厅 · Hot Cocoa', 'decoration'),
('https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=600&q=60', '圣诞树 · Night Lights', 'tree'),
('https://images.unsplash.com/photo-1512922124720-5166f2b3333f?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1512922124720-5166f2b3333f?auto=format&fit=crop&w=600&q=60', '交换礼物 · Gift Time', 'gifts'),
('https://images.unsplash.com/photo-1511117833895-4b473c0b1ca2?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1511117833895-4b473c0b1ca2?auto=format&fit=crop&w=600&q=60', '雪夜街道 · Winter Street', 'outdoor'),
('https://images.unsplash.com/photo-1544207240-42884e7fd55e?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1544207240-42884e7fd55e?auto=format&fit=crop&w=600&q=60', '姜饼屋 · Gingerbread', 'food'),
('https://images.unsplash.com/photo-1543709530-dcac245be8c6?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1543709530-dcac245be8c6?auto=format&fit=crop&w=600&q=60', '可爱鹿角 · Reindeer', 'decoration');

-- Initialize site stats for today
INSERT INTO site_stats (stat_date, visit_count, active_users, wishes_count, todos_count)
VALUES (CURDATE(), 0, 0, 0, 0)
ON DUPLICATE KEY UPDATE stat_date = stat_date;
