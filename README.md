# 🎄 Christmas Wonderland - 圣诞奇境

一个精美的圣诞节主题单页网站示例，使用原生 HTML、CSS 和 JavaScript 构建，无需任何第三方框架或库。

## ✨ 功能特色

- **⏳ 圣诞倒计时** - 实时显示距离圣诞节的天、小时、分钟和秒数
- **💌 心愿墙** - 写下你的圣诞愿望，数据保存在本地浏览器中
- **📅 圣诞日程** - 精美的时间线展示圣诞节前的计划安排
- **📸 氛围画廊** - 圣诞主题图片展示，支持点击放大预览
- **🎵 音乐播放器** - 简易音乐播放器，可自定义歌曲列表
- **✅ 待办清单** - 记录圣诞节的待办事项，支持完成标记和删除
- **📮 留言板** - 联系表单区域（静态展示）
- **❄️ 飘雪特效** - 动态雪花飘落效果，可开关
- **🌓 主题切换** - 支持明暗主题切换

## 🚀 快速开始

### 方式一：直接打开

直接在浏览器中打开 `index.html` 文件即可运行。

### 方式二：使用本地服务器

```bash
# 使用 Python 3
python -m http.server 8080

# 使用 Node.js（需安装 http-server）
npx http-server

# 使用 PHP
php -S localhost:8080
```

然后在浏览器中访问 `http://localhost:8080`

## 📁 项目结构

```
Demo/
├── index.html    # 主页面文件（包含所有 HTML、CSS 和 JavaScript）
└── README.md     # 项目说明文档
```

## 💾 数据存储

本项目使用浏览器的 `localStorage` 来持久化存储以下数据：

| 存储键 | 说明 |
|--------|------|
| `christmas-wishes` | 心愿墙数据 |
| `christmas-todos` | 待办清单数据 |
| `christmas-theme` | 主题偏好设置 |

## 🎨 自定义指南

### 修改音乐列表

在 `index.html` 文件中找到 `songs` 数组，添加你自己的 MP3 链接：

```javascript
const songs = [
  {
    title: "歌曲名称",
    artist: "艺术家",
    tag: "标签",
    url: "你的MP3链接"
  },
  // 添加更多歌曲...
];
```

### 替换画廊图片

在 HTML 中找到 `.gallery-item` 元素，替换 `data-src` 和 `img src` 属性中的图片链接。

### 修改颜色主题

在 CSS 的 `:root` 选择器中修改 CSS 变量来自定义配色方案：

```css
:root {
  --red: #ff4b5c;
  --green: #2ecc71;
  --gold: #f1c40f;
  /* 更多变量... */
}
```

## 🌐 浏览器支持

- Chrome（推荐）
- Firefox
- Safari
- Edge
- 其他现代浏览器

## 📝 许可证

本项目仅供学习和个人使用。

## 🎁 致谢

- 图片来源：[Unsplash](https://unsplash.com)
- 表情符号：Unicode Emoji

---

🎄 **祝你圣诞快乐，天天都有好心情！** 🎅
