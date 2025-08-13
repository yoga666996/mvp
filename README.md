# 🧩 WordSearch.sbs - 单词搜索拼图网站

一个完整的单词搜索拼图网站，包含在线游戏、PDF下载和自动生成系统。

## ✨ 功能特性

### 🎯 核心功能
- **拼图生成器**: 自动生成不同主题和难度的单词搜索拼图
- **在线游戏**: 可交互的浏览器游戏，支持拖拽选词
- **PDF下载**: 可打印的拼图版本，适合离线使用
- **响应式设计**: 支持桌面和移动设备

### 🎨 主题分类
- **Animals** 🦁 - 动物主题（简单/中等/困难）
- **Food** 🍎 - 食物主题（简单/中等/困难）
- **Nature** 🌳 - 自然主题（中等难度）
- **School** 📚 - 学校主题（中等难度）
- **Sports** ⚽ - 运动主题（中等难度）
- **Colors** 🌈 - 颜色主题（简单难度）

### 🎮 游戏特性
- 实时计时和计分系统
- 提示功能（点击单词列表或使用提示按钮）
- 拖拽选择单词（支持8个方向）
- 完成检测和祝贺页面
- 游戏重置功能

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 生成拼图内容
```bash
# 生成所有拼图
node generatePuzzles.js

# 测试单个拼图生成
node generatePuzzles.js --test
```

### 3. 生成游戏页面
```bash
# 生成所有游戏页面
node generateGamePages.js
```

### 4. 生成信息页面
```bash
# 生成所有拼图信息页面
node generatePages.js
```

### 5. 生成PDF文件
```bash
# 生成所有PDF文件
node generatePDFs.js
```

## 📁 项目结构

```
wordsearch/
├── index.html                 # 主首页
├── styles.css                 # 主样式文件
├── template.html              # 页面模板
├── puzzleIndex.json           # 拼图索引
├── sitemap.xml               # 网站地图
├── robots.txt                # 搜索引擎配置
│
├── wordSearchGenerator.js     # 拼图生成器核心
├── generatePuzzles.js         # 拼图生成脚本
├── generateGamePages.js       # 游戏页面生成
├── generatePages.js           # 信息页面生成
├── generatePDFs.js            # PDF生成脚本
│
├── play/                      # 游戏目录
│   ├── index.html            # 游戏目录页面
│   ├── game.css              # 游戏样式
│   ├── gameEngine.js         # 游戏引擎
│   └── *.html                # 各主题游戏页面
│
├── puzzles/                   # 拼图数据
│   └── *.json                # 拼图JSON文件
│
├── images/                    # 拼图图片
│   └── *.svg                 # SVG格式拼图图片
│
└── downloads/                 # PDF下载目录
    ├── index.html            # PDF下载页面
    └── *.pdf                 # PDF格式拼图文件
```

## 🛠️ 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **后端**: Node.js
- **PDF生成**: PDFKit
- **拼图生成**: 自定义算法
- **样式**: 现代CSS Grid/Flexbox布局

## 🎯 使用方法

### 在线游戏
1. 访问 `play/` 目录
2. 选择喜欢的主题和难度
3. 点击并拖拽选择单词
4. 找到所有单词完成游戏

### 下载PDF
1. 访问 `downloads/` 目录
2. 选择想要的拼图
3. 点击下载按钮
4. 打印并离线解决

### 自定义拼图
1. 修改 `wordSearchGenerator.js` 中的单词库
2. 运行生成脚本
3. 刷新页面查看新内容

## 🔧 自定义配置

### 添加新主题
在 `wordSearchGenerator.js` 中添加新的主题和单词：

```javascript
this.wordBank = {
    // 现有主题...
    newTheme: {
        easy: ['WORD1', 'WORD2', 'WORD3'],
        medium: ['MEDIUM1', 'MEDIUM2', 'MEDIUM3'],
        hard: ['HARD1', 'HARD2', 'HARD3']
    }
};
```

### 调整网格大小
修改生成器配置：

```javascript
const generator = new WordSearchGenerator({
    theme: 'animals',
    difficulty: 'medium',
    gridSize: 20  // 自定义网格大小
});
```

## 📊 性能特性

- **响应式设计**: 支持所有设备尺寸
- **懒加载**: 图片和资源按需加载
- **SEO优化**: 完整的meta标签和sitemap
- **无障碍访问**: 语义化HTML和键盘导航支持

## 🌟 特色亮点

1. **完全自动化**: 从拼图生成到页面发布全流程自动化
2. **多主题支持**: 6个不同主题，满足不同用户需求
3. **难度分级**: 简单/中等/困难三个难度级别
4. **双模式**: 在线游戏 + PDF下载，满足不同使用场景
5. **现代化UI**: 美观的渐变设计和流畅的动画效果

## 📈 扩展计划

- [ ] 用户账户系统
- [ ] 排行榜功能
- [ ] 更多主题和难度
- [ ] 移动应用版本
- [ ] 社交分享功能
- [ ] 多语言支持

## 📝 许可证

MIT License - 详见 LICENSE 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**WordSearch.sbs** - 让单词搜索变得有趣和便捷！ 🎉

*最后更新: 2025年8月13日* 