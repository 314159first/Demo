# 🎄 Christmas Wonderland - 圣诞奇境

一个精美的圣诞节主题全栈 Web 应用，包含前端展示页面和完整的后端 API 服务。

## ✨ 功能特色

### 前端功能
- **⏳ 圣诞倒计时** - 实时显示距离圣诞节的天、小时、分钟和秒数
- **💌 心愿墙** - 写下你的圣诞愿望，支持分类和匿名发布
- **📅 圣诞日程** - 精美的时间线展示圣诞节前的计划安排
- **📸 氛围画廊** - 圣诞主题图片展示，支持点击放大预览和上传
- **🎵 音乐播放器** - 圣诞歌曲播放器，支持播放计数
- **✅ 待办清单** - 记录圣诞节的待办事项，支持完成标记和删除
- **📮 留言板** - 联系表单区域
- **❄️ 飘雪特效** - 动态雪花飘落效果，可开关
- **🌓 主题切换** - 支持明暗主题切换

### 后端功能
- **用户认证** - 注册、登录，JWT Token 认证
- **心愿墙 API** - 创建和获取心愿，支持分类筛选和分页
- **待办事项 API** - 完整的 CRUD 操作，需用户认证
- **时间线 API** - 获取圣诞活动日程
- **图片画廊 API** - 获取和上传图片
- **音乐播放列表 API** - 获取歌曲和记录播放次数
- **网站统计 API** - 访问量和数据统计

## 🛠️ 技术栈

### 前端
- HTML5 / CSS3 / JavaScript (ES6+)
- 原生 CSS 动画和特效
- LocalStorage 数据持久化（离线模式）
- Fetch API 调用后端接口

### 后端
- **Node.js** - JavaScript 运行时
- **Express.js** - Web 框架
- **MySQL** - 数据库
- **JWT** - 身份认证
- **bcrypt** - 密码加密
- **multer** - 文件上传处理
- **cors** - 跨域支持

## 🚀 快速开始

### 前提条件

- Node.js v16.0.0 或更高版本
- MySQL 5.7 或更高版本
- npm v7.0.0 或更高版本

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-username/christmas-wonderland.git
cd christmas-wonderland
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件，填入你的数据库信息
```

4. **初始化数据库**
```bash
mysql -u root -p < database/schema.sql
```

5. **启动服务器**
```bash
# 开发模式（热重载）
npm run dev

# 生产模式
npm start
```

6. **访问应用**

在浏览器中打开 `http://localhost:3000`

## 📁 项目结构

```
christmas-wonderland/
├── database/
│   └── schema.sql          # MySQL 数据库架构和初始数据
├── docs/
│   ├── API.md              # API 接口文档
│   └── DEPLOYMENT.md       # 部署指南
├── public/
│   ├── js/
│   │   └── api-client.js   # 前端 API 客户端
│   └── uploads/            # 上传文件存储目录
│       └── .gitkeep
├── .env.example            # 环境变量模板
├── .gitignore              # Git 忽略规则
├── index.html              # 主页面
├── package.json            # 项目依赖配置
├── README.md               # 项目说明文档
└── server.js               # Express 服务器入口
```

## 📖 API 文档

详细的 API 文档请参阅 [docs/API.md](docs/API.md)

### 主要 API 端点

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/auth/register` | 用户注册 | - |
| POST | `/api/auth/login` | 用户登录 | - |
| GET | `/api/wishes` | 获取心愿列表 | - |
| POST | `/api/wishes` | 创建心愿 | 可选 |
| GET | `/api/todos` | 获取待办事项 | 必需 |
| POST | `/api/todos` | 创建待办事项 | 必需 |
| PATCH | `/api/todos/:id` | 更新待办事项 | 必需 |
| DELETE | `/api/todos/:id` | 删除待办事项 | 必需 |
| GET | `/api/timeline` | 获取时间线事件 | - |
| GET | `/api/gallery` | 获取画廊图片 | - |
| POST | `/api/gallery` | 上传图片 | 必需 |
| GET | `/api/music` | 获取播放列表 | - |
| POST | `/api/music/:id/play` | 记录播放次数 | - |
| GET | `/api/stats` | 获取网站统计 | - |
| POST | `/api/stats/visit` | 记录访问 | - |

## 💾 数据库

数据库包含以下数据表：

- `users` - 用户信息
- `wishes` - 心愿墙数据
- `todos` - 待办事项
- `timeline_events` - 时间线事件
- `gallery_images` - 画廊图片
- `music_playlist` - 音乐播放列表
- `site_stats` - 网站统计

## 🎨 自定义指南

### 修改音乐列表

在数据库中更新 `music_playlist` 表，或通过 API 添加歌曲。

### 替换画廊图片

1. 通过 API 上传新图片
2. 或直接在数据库 `gallery_images` 表中添加图片 URL

### 修改颜色主题

在 `index.html` 的 CSS `:root` 选择器中修改变量：

```css
:root {
  --red: #ff4b5c;
  --green: #2ecc71;
  --gold: #f1c40f;
}
```

## 🚢 部署

详细的部署指南请参阅 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

### 快速部署

```bash
# 使用 PM2
npm install -g pm2
pm2 start server.js --name christmas-wonderland
pm2 save
```

## 🌐 浏览器支持

- Chrome（推荐）
- Firefox
- Safari
- Edge
- 其他现代浏览器

## 🔒 安全说明

- 用户密码使用 bcrypt 加密存储
- API 使用 JWT Token 进行身份验证
- Token 有效期为 7 天
- 文件上传限制为 5MB，仅支持图片格式

## 📝 许可证

MIT License - 详见 [LICENSE](LICENSE)

## 🎁 致谢

- 图片来源：[Unsplash](https://unsplash.com)
- 表情符号：Unicode Emoji

---

🎄 **祝你圣诞快乐，天天都有好心情！** 🎅
