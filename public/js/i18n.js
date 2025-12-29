/**
 * Internationalization (i18n) Module
 * Provides multi-language support for Christmas Wonderland
 */

const i18n = {
  // Current language
  currentLang: 'zh',
  
  // Available languages
  languages: {
    zh: '中文',
    en: 'English'
  },
  
  // Translation dictionary
  translations: {
    zh: {
      // Page title and meta
      'page.title': '圣诞快乐 · Christmas Wonderland',
      
      // Navigation
      'nav.home': '首页',
      'nav.countdown': '倒计时',
      'nav.wishes': '心愿',
      'nav.timeline': '日程',
      'nav.gallery': '画廊',
      'nav.music': '音乐',
      'nav.todo': '待办',
      'nav.contact': '联系',
      
      // Theme toggle
      'theme.toggle': '切换主题',
      
      // Hero section
      'hero.badge': '✨ 2025 圣诞限定 · 单页展示',
      'hero.title.1': '圣诞快乐',
      'hero.title.2': '构建你的节日奇境',
      'hero.description': '这是一个集倒计时、心愿墙、圣诞日程、音乐播放、待办清单与飘雪特效于一体的圣诞单页示例，适合展示或二次开发。',
      'hero.btn.countdown': '查看倒计时',
      'hero.btn.wishes': '写下圣诞心愿',
      'hero.btn.gallery': '看看氛围图',
      'hero.meta.countdown': '实时更新倒计时',
      'hero.meta.localstorage': '💾 数据本地保存（localStorage）',
      'hero.meta.snowflake': '❄️ 动态飘雪特效可开关',
      'hero.meta.wishes': '心愿墙留言',
      'hero.meta.songs': '圣诞歌曲',
      
      // Christmas card
      'card.title': '点亮圣诞树的灯光，写下你的心愿，耐心等待奇迹到来 ✨',
      'card.btn': '写下心愿',
      
      // Countdown section
      'countdown.title': '⏳ 圣诞倒计时',
      'countdown.loading': '正在计算距离圣诞节的时间…',
      'countdown.days': '天',
      'countdown.hours': '小时',
      'countdown.minutes': '分钟',
      'countdown.seconds': '秒',
      'countdown.arrived': '🎄 圣诞节到啦！',
      
      // Wishes section
      'wishes.title': '💌 圣诞心愿墙',
      'wishes.subtitle': '把你的愿望写下来，或许圣诞老人会路过这里 👀',
      'wishes.form.label': '我的圣诞愿望',
      'wishes.form.placeholder': '例如：希望今年能有白色的圣诞节…',
      'wishes.form.anonymous': '匿名发布',
      'wishes.form.category': '愿望分类',
      'wishes.form.category.general': '通用',
      'wishes.form.category.health': '健康',
      'wishes.form.category.career': '事业',
      'wishes.form.category.love': '爱情',
      'wishes.form.category.family': '家庭',
      'wishes.form.submit': '🎁 发布心愿',
      'wishes.empty': '还没有人许愿呢，来做第一个吧 🎄',
      'wishes.author.anonymous': '匿名',
      
      // Timeline section
      'timeline.title': '📅 圣诞节前的小计划',
      'timeline.event1.date': '12 月 1-15 日',
      'timeline.event1.title': '准备阶段',
      'timeline.event1.meta': '布置房间 · 点亮圣诞树 · 选好圣诞歌单',
      'timeline.event1.desc': '可以先从换个桌面、挂彩灯、摆个小树开始，慢慢让生活进入圣诞模式。',
      'timeline.event2.date': '12 月 16-20 日',
      'timeline.event2.title': '期待升温',
      'timeline.event2.meta': '准备礼物 · 做圣诞料理 · 刷圣诞电影',
      'timeline.event2.desc': '这几天可能会更忙碌，但准备礼物和美食的过程也很美好。可以看看经典圣诞电影，氛围立马拉满。',
      'timeline.event3.date': '12 月 21-24 日',
      'timeline.event3.title': '平安夜前夜',
      'timeline.event3.meta': '与朋友聚会 · 包装礼物 · 互赠祝福',
      'timeline.event3.desc': '这个阶段最适合和朋友一起出去逛逛，看看灯光和装饰，感受一下节日氛围。',
      'timeline.event4.date': '12 月 25 日',
      'timeline.event4.title': '圣诞节',
      'timeline.event4.meta': '享受假期 · 与亲友团聚 · 记录美好瞬间',
      'timeline.event4.desc': '别忘了拍几张"今年的圣诞照"，未来翻到时，会觉得今天真好。',
      
      // Gallery section
      'gallery.title': '📸 氛围画廊',
      'gallery.subtitle': '圣诞的氛围藏在这些瞬间里',
      'gallery.upload': '📤 上传图片',
      'gallery.empty': '暂无图片',
      
      // Music section
      'music.title': '🎵 圣诞歌单',
      'music.subtitle': '在音乐中感受圣诞的温暖',
      'music.loading': '正在加载歌单…',
      'music.empty': '暂无歌曲',
      'music.plays': '次播放',
      
      // Todo section
      'todo.title': '✅ 圣诞待办清单',
      'todo.subtitle': '记下你想在圣诞节前完成的事',
      'todo.form.placeholder': '例如：给朋友准备礼物',
      'todo.form.submit': '➕ 添加',
      'todo.empty': '暂无待办事项',
      'todo.login.hint': '登录后可使用待办清单功能',
      'todo.login.btn': '去登录',
      
      // Contact section
      'contact.title': '📮 联系我们',
      'contact.subtitle': '有想法或建议？欢迎留言',
      'contact.form.name': '称呼',
      'contact.form.name.placeholder': '你的名字',
      'contact.form.email': '邮箱',
      'contact.form.email.placeholder': 'your@email.com',
      'contact.form.message': '留言内容',
      'contact.form.message.placeholder': '写下你的想法…',
      'contact.form.submit': '📨 发送',
      
      // Footer
      'footer.snow.toggle': '❄️ 开关飘雪',
      'footer.copyright': '🎄 祝你圣诞快乐！天天都有好心情 🎅',
      'footer.backtotop': '⬆️ 返回顶部',
      
      // Auth
      'auth.login': '登录',
      'auth.register': '注册',
      'auth.logout': '退出登录',
      'auth.username': '用户名',
      'auth.password': '密码',
      'auth.password.confirm': '确认密码',
      
      // Messages
      'msg.success': '成功',
      'msg.error': '错误',
      'msg.loading': '加载中...',
      'msg.wish.added': '心愿发布成功！',
      'msg.todo.added': '待办事项已添加',
      'msg.todo.deleted': '待办事项已删除',
      'msg.todo.completed': '待办事项已完成',
      'msg.upload.success': '上传成功',
      'msg.upload.error': '上传失败',
      'msg.contact.sent': '留言已发送',
      'msg.login.required': '请先登录',
      'msg.auth.success': '认证成功',
      'msg.auth.failed': '认证失败'
    },
    
    en: {
      // Page title and meta
      'page.title': 'Merry Christmas · Christmas Wonderland',
      
      // Navigation
      'nav.home': 'Home',
      'nav.countdown': 'Countdown',
      'nav.wishes': 'Wishes',
      'nav.timeline': 'Timeline',
      'nav.gallery': 'Gallery',
      'nav.music': 'Music',
      'nav.todo': 'Todo',
      'nav.contact': 'Contact',
      
      // Theme toggle
      'theme.toggle': 'Toggle Theme',
      
      // Hero section
      'hero.badge': '✨ 2025 Christmas Special · Single Page',
      'hero.title.1': 'Merry Christmas',
      'hero.title.2': 'Build Your Holiday Wonderland',
      'hero.description': 'An all-in-one Christmas showcase featuring countdown timer, wish wall, timeline, music player, todo list, and snowfall effects - perfect for display or further development.',
      'hero.btn.countdown': 'View Countdown',
      'hero.btn.wishes': 'Make a Wish',
      'hero.btn.gallery': 'View Gallery',
      'hero.meta.countdown': 'Real-time countdown',
      'hero.meta.localstorage': '💾 Data stored locally (localStorage)',
      'hero.meta.snowflake': '❄️ Toggle snowflake effects',
      'hero.meta.wishes': 'Wish wall messages',
      'hero.meta.songs': 'Christmas songs',
      
      // Christmas card
      'card.title': 'Light up the Christmas tree, write down your wishes, and patiently wait for miracles to happen ✨',
      'card.btn': 'Make a Wish',
      
      // Countdown section
      'countdown.title': '⏳ Christmas Countdown',
      'countdown.loading': 'Calculating time until Christmas...',
      'countdown.days': 'Days',
      'countdown.hours': 'Hours',
      'countdown.minutes': 'Minutes',
      'countdown.seconds': 'Seconds',
      'countdown.arrived': '🎄 Merry Christmas!',
      
      // Wishes section
      'wishes.title': '💌 Christmas Wish Wall',
      'wishes.subtitle': 'Write down your wishes, Santa might pass by here 👀',
      'wishes.form.label': 'My Christmas Wish',
      'wishes.form.placeholder': 'e.g., Hope for a white Christmas this year...',
      'wishes.form.anonymous': 'Post Anonymously',
      'wishes.form.category': 'Category',
      'wishes.form.category.general': 'General',
      'wishes.form.category.health': 'Health',
      'wishes.form.category.career': 'Career',
      'wishes.form.category.love': 'Love',
      'wishes.form.category.family': 'Family',
      'wishes.form.submit': '🎁 Post Wish',
      'wishes.empty': 'No wishes yet, be the first! 🎄',
      'wishes.author.anonymous': 'Anonymous',
      
      // Timeline section
      'timeline.title': '📅 Christmas Planning',
      'timeline.event1.date': 'Dec 1-15',
      'timeline.event1.title': 'Preparation Phase',
      'timeline.event1.meta': 'Decorate room · Light up tree · Prepare playlist',
      'timeline.event1.desc': 'Start by changing wallpaper, hanging lights, setting up a small tree, and gradually enter Christmas mode.',
      'timeline.event2.date': 'Dec 16-20',
      'timeline.event2.title': 'Anticipation Builds',
      'timeline.event2.meta': 'Prepare gifts · Cook Christmas food · Watch movies',
      'timeline.event2.desc': 'These days might be busier, but preparing gifts and food is also wonderful. Watch some classic Christmas movies to boost the atmosphere.',
      'timeline.event3.date': 'Dec 21-24',
      'timeline.event3.title': 'Christmas Eve Approaches',
      'timeline.event3.meta': 'Gather with friends · Wrap gifts · Share blessings',
      'timeline.event3.desc': 'Perfect time to go out with friends, see lights and decorations, and feel the festive atmosphere.',
      'timeline.event4.date': 'Dec 25',
      'timeline.event4.title': 'Christmas Day',
      'timeline.event4.meta': 'Enjoy holiday · Reunite with loved ones · Capture moments',
      'timeline.event4.desc': "Don't forget to take some \"this year's Christmas photos\" - you'll cherish them in the future.",
      
      // Gallery section
      'gallery.title': '📸 Gallery',
      'gallery.subtitle': 'Christmas atmosphere in these moments',
      'gallery.upload': '📤 Upload Image',
      'gallery.empty': 'No images yet',
      
      // Music section
      'music.title': '🎵 Christmas Playlist',
      'music.subtitle': 'Feel the warmth of Christmas through music',
      'music.loading': 'Loading playlist...',
      'music.empty': 'No songs available',
      'music.plays': 'plays',
      
      // Todo section
      'todo.title': '✅ Christmas Todo List',
      'todo.subtitle': 'Track what you want to complete before Christmas',
      'todo.form.placeholder': 'e.g., Prepare gifts for friends',
      'todo.form.submit': '➕ Add',
      'todo.empty': 'No todos yet',
      'todo.login.hint': 'Login to use todo list feature',
      'todo.login.btn': 'Login',
      
      // Contact section
      'contact.title': '📮 Contact Us',
      'contact.subtitle': 'Got ideas or suggestions? Feel free to reach out',
      'contact.form.name': 'Name',
      'contact.form.name.placeholder': 'Your name',
      'contact.form.email': 'Email',
      'contact.form.email.placeholder': 'your@email.com',
      'contact.form.message': 'Message',
      'contact.form.message.placeholder': 'Share your thoughts...',
      'contact.form.submit': '📨 Send',
      
      // Footer
      'footer.snow.toggle': '❄️ Toggle Snow',
      'footer.copyright': '🎄 Merry Christmas! Wishing you joy every day 🎅',
      'footer.backtotop': '⬆️ Back to Top',
      
      // Auth
      'auth.login': 'Login',
      'auth.register': 'Register',
      'auth.logout': 'Logout',
      'auth.username': 'Username',
      'auth.password': 'Password',
      'auth.password.confirm': 'Confirm Password',
      
      // Messages
      'msg.success': 'Success',
      'msg.error': 'Error',
      'msg.loading': 'Loading...',
      'msg.wish.added': 'Wish posted successfully!',
      'msg.todo.added': 'Todo added',
      'msg.todo.deleted': 'Todo deleted',
      'msg.todo.completed': 'Todo completed',
      'msg.upload.success': 'Upload successful',
      'msg.upload.error': 'Upload failed',
      'msg.contact.sent': 'Message sent',
      'msg.login.required': 'Please login first',
      'msg.auth.success': 'Authentication successful',
      'msg.auth.failed': 'Authentication failed'
    }
  },
  
  /**
   * Initialize i18n
   */
  init() {
    // Load saved language from localStorage
    const savedLang = localStorage.getItem('christmas-lang');
    if (savedLang && this.translations[savedLang]) {
      this.currentLang = savedLang;
    } else {
      // Detect browser language
      const browserLang = navigator.language || navigator.userLanguage;
      if (browserLang.startsWith('zh')) {
        this.currentLang = 'zh';
      } else {
        this.currentLang = 'en';
      }
    }
    
    // Apply language
    this.applyLanguage();
    
    // Update language selector if exists
    this.updateLanguageSelector();
  },
  
  /**
   * Get translation for a key
   */
  t(key) {
    return this.translations[this.currentLang][key] || key;
  },
  
  /**
   * Switch language
   */
  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem('christmas-lang', lang);
      this.applyLanguage();
      this.updateLanguageSelector();
    }
  },
  
  /**
   * Apply language to all elements with data-i18n attribute
   */
  applyLanguage() {
    // Update page title
    document.title = this.t('page.title');
    
    // Update HTML lang attribute
    document.documentElement.lang = this.currentLang === 'zh' ? 'zh-CN' : 'en';
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.t(key);
      
      // Check if element has data-i18n-attr to update attribute instead of text
      const attr = el.getAttribute('data-i18n-attr');
      if (attr) {
        el.setAttribute(attr, translation);
      } else {
        el.textContent = translation;
      }
    });
    
    // Update all elements with data-i18n-placeholder attribute
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.t(key);
    });
    
    // Update all elements with data-i18n-html attribute (for HTML content)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      el.innerHTML = this.t(key);
    });
  },
  
  /**
   * Update language selector UI
   */
  updateLanguageSelector() {
    const selector = document.getElementById('language-selector');
    if (selector) {
      selector.value = this.currentLang;
    }
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => i18n.init());
} else {
  i18n.init();
}
