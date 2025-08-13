/**
 * WordSearch Puzzle Generator
 * 生成不同主题和难度的单词搜索拼图
 */

class WordSearchGenerator {
    constructor(options = {}) {
        this.gridSize = options.gridSize || 15;
        this.theme = options.theme || 'animals';
        this.difficulty = options.difficulty || 'medium';
        
        // 单词库按主题分类
        this.wordBank = {
            animals: {
                easy: ['CAT', 'DOG', 'BIRD', 'FISH', 'BEAR'],
                medium: ['ELEPHANT', 'TIGER', 'RABBIT', 'MONKEY', 'GIRAFFE', 'ZEBRA', 'LION'],
                hard: ['RHINOCEROS', 'HIPPOPOTAMUS', 'CHIMPANZEE', 'CROCODILE', 'KANGAROO', 'BUTTERFLY', 'PENGUIN', 'DOLPHIN']
            },
            food: {
                easy: ['APPLE', 'BREAD', 'CAKE', 'MILK', 'RICE'],
                medium: ['PIZZA', 'BURGER', 'CHEESE', 'ORANGE', 'BANANA', 'PASTA', 'CHICKEN'],
                hard: ['STRAWBERRY', 'CHOCOLATE', 'SPAGHETTI', 'HAMBURGER', 'SANDWICH', 'WATERMELON', 'PINEAPPLE']
            },
            nature: {
                easy: ['TREE', 'ROCK', 'LEAF', 'FLOWER', 'GRASS'],
                medium: ['MOUNTAIN', 'FOREST', 'RIVER', 'OCEAN', 'DESERT', 'VALLEY', 'GARDEN'],
                hard: ['WATERFALL', 'BUTTERFLY', 'RAINBOW', 'LIGHTNING', 'EARTHQUAKE', 'HURRICANE', 'BLIZZARD']
            },
            school: {
                easy: ['BOOK', 'PEN', 'DESK', 'MATH', 'READ'],
                medium: ['TEACHER', 'STUDENT', 'LESSON', 'HOMEWORK', 'LIBRARY', 'SCIENCE', 'HISTORY'],
                hard: ['GEOGRAPHY', 'CHEMISTRY', 'BIOLOGY', 'MATHEMATICS', 'LITERATURE', 'PHILOSOPHY', 'PSYCHOLOGY']
            },
            sports: {
                easy: ['BALL', 'RUN', 'JUMP', 'SWIM', 'BIKE'],
                medium: ['SOCCER', 'TENNIS', 'HOCKEY', 'BOXING', 'SKIING', 'RACING', 'DIVING'],
                hard: ['BASKETBALL', 'VOLLEYBALL', 'BADMINTON', 'WRESTLING', 'GYMNASTICS', 'ATHLETICS', 'SWIMMING']
            },
            colors: {
                easy: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'BLACK'],
                medium: ['PURPLE', 'ORANGE', 'PINK', 'BROWN', 'WHITE', 'GRAY', 'SILVER'],
                hard: ['TURQUOISE', 'MAGENTA', 'CRIMSON', 'EMERALD', 'SAPPHIRE', 'LAVENDER', 'MAROON']
            }
        };
        
        // 8个方向：水平、垂直、对角线
        this.directions = [
            [0, 1],   // 右
            [1, 0],   // 下
            [1, 1],   // 右下
            [1, -1],  // 左下
            [0, -1],  // 左
            [-1, 0],  // 上
            [-1, -1], // 左上
            [-1, 1]   // 右上
        ];
        
        this.grid = [];
        this.placedWords = [];
    }
    
    // 生成完整的拼图
    generate() {
        this.initializeGrid();
        const words = this.getWordsForDifficulty();
        
        // 尝试放置所有单词
        for (const word of words) {
            this.placeWord(word);
        }
        
        // 填充空白位置
        this.fillEmptySpaces();
        
        return {
            grid: this.grid,
            words: this.placedWords,
            theme: this.theme,
            difficulty: this.difficulty,
            size: this.gridSize
        };
    }
    
    // 初始化空网格
    initializeGrid() {
        this.grid = [];
        for (let i = 0; i < this.gridSize; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.gridSize; j++) {
                this.grid[i][j] = '';
            }
        }
        this.placedWords = [];
    }
    
    // 根据难度获取单词
    getWordsForDifficulty() {
        const themeWords = this.wordBank[this.theme];
        if (!themeWords) {
            console.warn(`主题 '${this.theme}' 不存在，使用默认主题 'animals'`);
            return this.wordBank.animals[this.difficulty] || this.wordBank.animals.medium;
        }
        
        const difficultyWords = themeWords[this.difficulty];
        if (!difficultyWords || !Array.isArray(difficultyWords)) {
            console.warn(`难度 '${this.difficulty}' 在主题 '${this.theme}' 中不存在，使用 medium 难度`);
            return themeWords.medium || themeWords.easy || [];
        }
        
        let words = [...difficultyWords];
        
        // 根据网格大小调整单词数量
        const maxWords = Math.floor(this.gridSize * this.gridSize / 10);
        words = words.slice(0, Math.min(words.length, maxWords));
        
        return this.shuffleArray(words);
    }
    
    // 尝试在网格中放置单词
    placeWord(word) {
        const maxAttempts = 100;
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            const row = Math.floor(Math.random() * this.gridSize);
            const col = Math.floor(Math.random() * this.gridSize);
            const direction = this.directions[Math.floor(Math.random() * this.directions.length)];
            
            if (this.canPlaceWord(word, row, col, direction)) {
                this.placeWordInGrid(word, row, col, direction);
                this.placedWords.push({
                    word: word,
                    startRow: row,
                    startCol: col,
                    direction: direction,
                    found: false
                });
                return true;
            }
            
            attempts++;
        }
        
        return false;
    }
    
    // 检查是否可以在指定位置和方向放置单词
    canPlaceWord(word, startRow, startCol, direction) {
        const [rowDir, colDir] = direction;
        
        for (let i = 0; i < word.length; i++) {
            const row = startRow + (i * rowDir);
            const col = startCol + (i * colDir);
            
            // 检查边界
            if (row < 0 || row >= this.gridSize || col < 0 || col >= this.gridSize) {
                return false;
            }
            
            // 检查位置是否已被占用（除非是相同字母）
            if (this.grid[row][col] !== '' && this.grid[row][col] !== word[i]) {
                return false;
            }
        }
        
        return true;
    }
    
    // 在网格中实际放置单词
    placeWordInGrid(word, startRow, startCol, direction) {
        const [rowDir, colDir] = direction;
        
        for (let i = 0; i < word.length; i++) {
            const row = startRow + (i * rowDir);
            const col = startCol + (i * colDir);
            this.grid[row][col] = word[i];
        }
    }
    
    // 用随机字母填充空白位置
    fillEmptySpaces() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === '') {
                    this.grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
                }
            }
        }
    }
    
    // 打乱数组
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    // 生成SVG图像
    generateSVG(options = {}) {
        const cellSize = options.cellSize || 30;
        const fontSize = options.fontSize || 18;
        const width = this.gridSize * cellSize + 100;
        const height = this.gridSize * cellSize + 200;
        
        let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <style>
      .grid-cell { fill: #ffffff; stroke: #333333; stroke-width: 1; }
      .grid-text { font-family: 'Courier New', monospace; font-size: ${fontSize}px; text-anchor: middle; dominant-baseline: middle; fill: #333333; font-weight: bold; }
      .title { font-family: 'Arial', sans-serif; font-size: 24px; text-anchor: middle; fill: #2c3e50; font-weight: bold; }
      .word-list { font-family: 'Arial', sans-serif; font-size: 14px; fill: #666666; }
    </style>
  </defs>
  
  <!-- 背景 -->
  <rect width="${width}" height="${height}" fill="#f8f9fa"/>
  
  <!-- 标题 -->
  <text x="${width/2}" y="30" class="title">${this.theme.toUpperCase()} Word Search - ${this.difficulty.toUpperCase()}</text>
  
  <!-- 网格 -->`;

        // 绘制网格和字母
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const x = j * cellSize + 50;
                const y = i * cellSize + 60;
                
                svg += `
  <rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" class="grid-cell"/>
  <text x="${x + cellSize/2}" y="${y + cellSize/2}" class="grid-text">${this.grid[i][j]}</text>`;
            }
        }
        
        // 单词列表
        const wordsListY = this.gridSize * cellSize + 100;
        svg += `
  <text x="50" y="${wordsListY}" class="title">Find these words:</text>`;
        
        const wordsPerRow = Math.ceil(Math.sqrt(this.placedWords.length));
        this.placedWords.forEach((wordInfo, index) => {
            const row = Math.floor(index / wordsPerRow);
            const col = index % wordsPerRow;
            const x = 50 + col * 150;
            const y = wordsListY + 30 + row * 25;
            
            svg += `
  <text x="${x}" y="${y}" class="word-list">• ${wordInfo.word}</text>`;
        });
        
        svg += `
</svg>`;
        
        return svg;
    }
}

// Node.js 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WordSearchGenerator;
}

// 浏览器全局变量
if (typeof window !== 'undefined') {
    window.WordSearchGenerator = WordSearchGenerator;
}