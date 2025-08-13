/**
 * 生成多个主题的单词搜索拼图
 */

const fs = require('fs');
const path = require('path');
const WordSearchGenerator = require('./wordSearchGenerator.js');

// 确保目录存在
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// 生成拼图配置
const puzzleConfigs = [
    { theme: 'animals', difficulty: 'easy', gridSize: 12 },
    { theme: 'animals', difficulty: 'medium', gridSize: 15 },
    { theme: 'animals', difficulty: 'hard', gridSize: 18 },
    { theme: 'food', difficulty: 'easy', gridSize: 12 },
    { theme: 'food', difficulty: 'medium', gridSize: 15 },
    { theme: 'food', difficulty: 'hard', gridSize: 18 },
    { theme: 'nature', difficulty: 'medium', gridSize: 15 },
    { theme: 'school', difficulty: 'medium', gridSize: 15 },
    { theme: 'sports', difficulty: 'medium', gridSize: 15 },
    { theme: 'colors', difficulty: 'easy', gridSize: 12 }
];

// 生成所有拼图
function generateAllPuzzles() {
    console.log('🎮 开始生成单词搜索拼图...');
    
    ensureDirectoryExists('./images');
    ensureDirectoryExists('./puzzles');
    
    puzzleConfigs.forEach((config, index) => {
        console.log(`📝 正在生成: ${config.theme} - ${config.difficulty}...`);
        
        try {
            // 创建生成器
            const generator = new WordSearchGenerator(config);
            
            // 生成拼图
            const puzzle = generator.generate();
            
            // 文件名
            const fileName = `${config.theme}-${config.difficulty}`;
            
            // 保存拼图数据
            const puzzleData = {
                ...puzzle,
                metadata: {
                    title: `${config.theme.charAt(0).toUpperCase() + config.theme.slice(1)} Word Search`,
                    description: `Find all the ${config.theme} related words in this ${config.difficulty} difficulty puzzle.`,
                    keywords: puzzle.words.map(w => w.word.toLowerCase()).join(', '),
                    generated: new Date().toISOString()
                }
            };
            
            fs.writeFileSync(
                path.join('./puzzles', `${fileName}.json`),
                JSON.stringify(puzzleData, null, 2)
            );
            
            // 生成SVG图像
            const svg = generator.generateSVG();
            fs.writeFileSync(
                path.join('./images', `${fileName}.svg`),
                svg
            );
            
            console.log(`✅ 完成: ${fileName}`);
            
        } catch (error) {
            console.error(`❌ 生成 ${config.theme}-${config.difficulty} 时出错:`, error.message);
        }
    });
    
    console.log('🎉 所有拼图生成完成！');
    
    // 生成拼图索引
    generatePuzzleIndex();
}

// 生成拼图索引文件
function generatePuzzleIndex() {
    console.log('📋 生成拼图索引...');
    
    const puzzles = [];
    
    puzzleConfigs.forEach(config => {
        const fileName = `${config.theme}-${config.difficulty}`;
        puzzles.push({
            slug: fileName,
            theme: config.theme,
            difficulty: config.difficulty,
            gridSize: config.gridSize,
            title: `${config.theme.charAt(0).toUpperCase() + config.theme.slice(1)} Word Search - ${config.difficulty.charAt(0).toUpperCase() + config.difficulty.slice(1)}`,
            image: `${fileName}.svg`,
            jsonFile: `${fileName}.json`
        });
    });
    
    const index = {
        puzzles: puzzles,
        themes: [...new Set(puzzles.map(p => p.theme))],
        difficulties: [...new Set(puzzles.map(p => p.difficulty))],
        totalCount: puzzles.length,
        lastUpdated: new Date().toISOString()
    };
    
    fs.writeFileSync('./puzzleIndex.json', JSON.stringify(index, null, 2));
    console.log('✅ 拼图索引生成完成');
}

// 生成单个拼图（用于测试）
function generateSinglePuzzle(theme = 'animals', difficulty = 'medium') {
    console.log(`🧪 测试生成单个拼图: ${theme} - ${difficulty}`);
    
    const generator = new WordSearchGenerator({ 
        theme: theme, 
        difficulty: difficulty, 
        gridSize: 15 
    });
    
    const puzzle = generator.generate();
    
    console.log('📋 拼图信息:');
    console.log(`- 主题: ${puzzle.theme}`);
    console.log(`- 难度: ${puzzle.difficulty}`);
    console.log(`- 网格大小: ${puzzle.size}x${puzzle.size}`);
    console.log(`- 单词数量: ${puzzle.words.length}`);
    console.log('- 单词列表:', puzzle.words.map(w => w.word).join(', '));
    
    // 显示网格的一部分
    console.log('\n🎯 网格预览 (前5行):');
    for (let i = 0; i < Math.min(5, puzzle.grid.length); i++) {
        console.log(puzzle.grid[i].slice(0, 10).join(' '));
    }
    
    return puzzle;
}

// 主函数
function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--test')) {
        // 测试模式
        const themeIndex = args.indexOf('--theme');
        const difficultyIndex = args.indexOf('--difficulty');
        
        const theme = (themeIndex !== -1 && args[themeIndex + 1]) ? args[themeIndex + 1] : 'animals';
        const difficulty = (difficultyIndex !== -1 && args[difficultyIndex + 1]) ? args[difficultyIndex + 1] : 'medium';
        
        generateSinglePuzzle(theme, difficulty);
    } else {
        // 生成所有拼图
        generateAllPuzzles();
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = {
    generateAllPuzzles,
    generateSinglePuzzle,
    generatePuzzleIndex
};