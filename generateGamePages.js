/**
 * 为每个拼图生成专门的游戏页面
 */

const fs = require('fs');
const path = require('path');

// 读取拼图索引
function loadPuzzleIndex() {
    try {
        const indexPath = './puzzleIndex.json';
        const indexData = fs.readFileSync(indexPath, 'utf-8');
        return JSON.parse(indexData);
    } catch (error) {
        console.error('读取拼图索引失败:', error);
        return null;
    }
}

// 生成单个游戏页面
function generateGamePage(puzzle) {
    const gamePageHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${puzzle.title} - WordSearch.sbs</title>
    <meta name="description" content="Play ${puzzle.title} online. Find all the ${puzzle.theme} related words in this ${puzzle.difficulty} difficulty puzzle.">
    <meta name="keywords" content="${puzzle.theme}, word search, puzzle, ${puzzle.difficulty}, online game">
    <link rel="stylesheet" href="../styles.css">
    <link rel="stylesheet" href="game.css">
</head>
<body>
    <header>
        <div class="container">
            <h1 id="gameTitle">${puzzle.title}</h1>
            <div class="game-controls">
                <button id="hintBtn" class="control-btn">💡 Hint</button>
                <button id="resetBtn" class="control-btn">🔄 Reset</button>
                <button id="backBtn" class="control-btn" onclick="window.location.href='../${puzzle.slug}.html'">⬅️ Back to Info</button>
                <button id="homeBtn" class="control-btn" onclick="window.location.href='../index.html'">🏠 Home</button>
            </div>
        </div>
    </header>

    <main class="container">
        <div class="game-layout">
            <!-- 左侧：游戏网格 -->
            <div class="game-grid-container">
                <div class="game-stats">
                    <div class="stat-item">
                        <span class="stat-label">⏱️ Time:</span>
                        <span id="timer">00:00</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">📝 Found:</span>
                        <span id="foundCount">0</span>/<span id="totalCount">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">⭐ Score:</span>
                        <span id="score">0</span>
                    </div>
                </div>
                
                <div id="gameGrid" class="game-grid">
                    <div class="loading">Loading puzzle...</div>
                </div>
                
                <div id="gameMessage" class="game-message hidden">
                    <div class="message-content">
                        <h2>🎉 Congratulations!</h2>
                        <p>You found all the words!</p>
                        <div class="final-stats">
                            <div>Time: <span id="finalTime">00:00</span></div>
                            <div>Score: <span id="finalScore">0</span></div>
                        </div>
                        <div style="margin-top: 1rem;">
                            <button id="playAgainBtn" class="control-btn">🎮 Play Again</button>
                            <button class="control-btn" onclick="window.location.href='../index.html'" style="margin-left: 1rem;">🏠 More Puzzles</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 右侧：单词列表 -->
            <div class="word-list-container">
                <h3>Find These Words:</h3>
                <ul id="wordList" class="word-list">
                    <!-- 单词列表将在这里动态生成 -->
                </ul>
                
                <div class="game-info">
                    <h4>📊 Puzzle Info:</h4>
                    <div class="info-item">Theme: <strong>${puzzle.theme.charAt(0).toUpperCase() + puzzle.theme.slice(1)}</strong></div>
                    <div class="info-item">Difficulty: <strong>${puzzle.difficulty.charAt(0).toUpperCase() + puzzle.difficulty.slice(1)}</strong></div>
                    <div class="info-item">Grid Size: <strong>${puzzle.gridSize}x${puzzle.gridSize}</strong></div>
                </div>
                
                <div class="game-tips">
                    <h4>🎯 How to Play:</h4>
                    <ul>
                        <li>Click and drag to select words</li>
                        <li>Words can be horizontal, vertical, or diagonal</li>
                        <li>Words can be forwards or backwards</li>
                        <li>Click on a word in the list for a hint</li>
                        <li>Find all words to complete the puzzle</li>
                    </ul>
                </div>
            </div>
        </div>
    </main>

    <footer>
        <div class="container">
            <p>&copy; 2025 WordSearch.sbs - All rights reserved. | <a href="../index.html" style="color: white;">Home</a> | <a href="../privacy" style="color: white;">Privacy Policy</a></p>
        </div>
    </footer>

    <!-- 加载脚本 -->
    <script src="gameEngine.js"></script>
    <script>
        // 启动特定拼图的游戏
        document.addEventListener('DOMContentLoaded', function() {
            startGame('${puzzle.slug}');
        });
    </script>
</body>
</html>`;
    
    return gamePageHTML;
}

// 生成所有游戏页面
function generateAllGamePages() {
    console.log('🎮 开始生成游戏页面...');
    
    const puzzleIndex = loadPuzzleIndex();
    if (!puzzleIndex) {
        console.error('无法加载拼图索引');
        return;
    }
    
    // 确保play目录存在
    const playDir = './play';
    if (!fs.existsSync(playDir)) {
        fs.mkdirSync(playDir, { recursive: true });
    }
    
    let successCount = 0;
    
    puzzleIndex.puzzles.forEach(puzzle => {
        try {
            const gamePageHTML = generateGamePage(puzzle);
            const fileName = `${puzzle.slug}.html`;
            const filePath = path.join(playDir, fileName);
            
            fs.writeFileSync(filePath, gamePageHTML);
            console.log(`✅ 生成: play/${fileName}`);
            successCount++;
            
        } catch (error) {
            console.error(`❌ 生成 ${puzzle.slug} 页面失败:`, error.message);
        }
    });
    
    console.log(`🎉 游戏页面生成完成! 成功生成 ${successCount} 个页面`);
    
    // 生成游戏页面索引
    generatePlayIndex(puzzleIndex);
}

// 生成游戏目录页面
function generatePlayIndex(puzzleIndex) {
    console.log('📋 生成游戏目录页面...');
    
    const indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Play Word Search Games - WordSearch.sbs</title>
    <meta name="description" content="Play word search puzzles online. Choose from different themes and difficulty levels.">
    <meta name="keywords" content="word search, online games, puzzles, brain games">
    <link rel="stylesheet" href="../styles.css">
    <link rel="stylesheet" href="game.css">
    <style>
        .play-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
            margin: 2rem 0;
        }
        
        .play-card {
            background: white;
            border-radius: 15px;
            padding: 1.5rem;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            border: 2px solid transparent;
        }
        
        .play-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            border-color: #3498db;
        }
        
        .play-card h3 {
            color: #2c3e50;
            margin-bottom: 1rem;
            font-size: 1.3rem;
        }
        
        .play-info {
            display: flex;
            justify-content: space-between;
            margin: 1rem 0;
            font-size: 14px;
            color: #666;
        }
        
        .difficulty-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .difficulty-easy { background: #d5f4e6; color: #27ae60; }
        .difficulty-medium { background: #fef9e7; color: #f39c12; }
        .difficulty-hard { background: #fadbd8; color: #e74c3c; }
        
        .play-btn {
            width: 100%;
            background: linear-gradient(45deg, #3498db, #2980b9);
            color: white;
            border: none;
            padding: 12px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: block;
            text-align: center;
        }
        
        .play-btn:hover {
            background: linear-gradient(45deg, #2980b9, #1f5f8b);
            transform: translateY(-1px);
        }
        
        .theme-filter {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 1rem;
            margin: 2rem 0;
        }
        
        .filter-btn {
            padding: 8px 16px;
            border: 2px solid #3498db;
            background: white;
            color: #3498db;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 500;
        }
        
        .filter-btn:hover,
        .filter-btn.active {
            background: #3498db;
            color: white;
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>🎮 Play Word Search Games</h1>
            <p>Choose your puzzle and start playing online!</p>
        </div>
    </header>

    <main class="container">
        <div class="theme-filter">
            <button class="filter-btn active" onclick="filterTheme('all')">All Themes</button>
            ${puzzleIndex.themes.map(theme => 
                `<button class="filter-btn" onclick="filterTheme('${theme}')">${theme.charAt(0).toUpperCase() + theme.slice(1)}</button>`
            ).join('\n            ')}
        </div>

        <div class="play-grid" id="puzzleGrid">
            ${puzzleIndex.puzzles.map(puzzle => `
            <div class="play-card" data-theme="${puzzle.theme}">
                <h3>${puzzle.title}</h3>
                <div class="play-info">
                    <span>Theme: ${puzzle.theme.charAt(0).toUpperCase() + puzzle.theme.slice(1)}</span>
                    <span class="difficulty-badge difficulty-${puzzle.difficulty}">${puzzle.difficulty}</span>
                </div>
                <div class="play-info">
                    <span>Grid: ${puzzle.gridSize}x${puzzle.gridSize}</span>
                    <span>🎯 Click to Play</span>
                </div>
                <a href="${puzzle.slug}.html" class="play-btn">🎮 Start Playing</a>
            </div>
            `).join('\n            ')}
        </div>
        
        <section style="text-align: center; margin: 3rem 0;">
            <h2>Why Play Our Word Search Games?</h2>
            <div style="max-width: 600px; margin: 0 auto; color: #666; line-height: 1.6;">
                <p>Our word search puzzles are perfect for improving vocabulary, concentration, and pattern recognition. Each puzzle is carefully crafted with themed words to make learning fun and engaging.</p>
            </div>
        </section>
    </main>

    <footer>
        <div class="container">
            <p>&copy; 2025 WordSearch.sbs - All rights reserved. | <a href="../index.html" style="color: white;">Home</a> | <a href="../privacy" style="color: white;">Privacy Policy</a></p>
        </div>
    </footer>

    <script>
        function filterTheme(theme) {
            const cards = document.querySelectorAll('.play-card');
            const buttons = document.querySelectorAll('.filter-btn');
            
            // 更新按钮状态
            buttons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            // 过滤卡片
            cards.forEach(card => {
                if (theme === 'all' || card.dataset.theme === theme) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }
    </script>
</body>
</html>`;
    
    fs.writeFileSync('./play/index.html', indexHTML);
    console.log('✅ 游戏目录页面生成完成: play/index.html');
}

// 主函数
function main() {
    generateAllGamePages();
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = {
    generateAllGamePages,
    generateGamePage,
    generatePlayIndex
};