/**
 * PDF生成器 - 为每个拼图生成可打印的PDF版本
 */

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const SVGtoPDF = require('svg-to-pdfkit');

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

// 读取拼图数据
function loadPuzzleData(puzzleFile) {
    try {
        const puzzlePath = `./puzzles/${puzzleFile}`;
        const puzzleData = fs.readFileSync(puzzlePath, 'utf-8');
        return JSON.parse(puzzleData);
    } catch (error) {
        console.error(`读取拼图数据失败: ${puzzleFile}`, error);
        return null;
    }
}

// 生成PDF页面
function generatePDF(puzzle, puzzleData) {
    try {
        // 创建PDF文档
        const doc = new PDFDocument({
            size: 'A4',
            margins: {
                top: 50,
                bottom: 50,
                left: 50,
                right: 50
            }
        });
        
        const fileName = `${puzzle.slug}.pdf`;
        const filePath = path.join('./downloads', fileName);
        const stream = fs.createWriteStream(filePath);
        
        doc.pipe(stream);
        
        // 添加标题
        doc.fontSize(24)
           .font('Helvetica-Bold')
           .text(puzzle.title, { align: 'center' });
        
        doc.moveDown(0.5);
        
        // 添加副标题
        doc.fontSize(14)
           .font('Helvetica')
           .text(`${puzzle.theme.charAt(0).toUpperCase() + puzzle.theme.slice(1)} Theme - ${puzzle.difficulty.charAt(0).toUpperCase() + puzzle.difficulty.slice(1)} Difficulty`, { align: 'center' });
        
        doc.moveDown(1);
        
        // 添加说明
        doc.fontSize(12)
           .text('Find all the hidden words in the grid below. Words can be horizontal, vertical, or diagonal, and may be forwards or backwards.', { align: 'center' });
        
        doc.moveDown(1);
        
        // 计算网格尺寸
        const gridSize = puzzle.gridSize;
        const cellSize = Math.min(400 / gridSize, 25); // 最大400px宽度，最小25px单元格
        const gridWidth = gridSize * cellSize;
        const gridHeight = gridSize * cellSize;
        
        // 居中网格
        const startX = (doc.page.width - doc.page.margins.left - doc.page.margins.right - gridWidth) / 2 + doc.page.margins.left;
        const startY = doc.y + 20;
        
        // 绘制网格
        doc.rect(startX, startY, gridWidth, gridHeight)
           .stroke();
        
        // 绘制网格线
        for (let i = 1; i < gridSize; i++) {
            // 垂直线
            doc.moveTo(startX + i * cellSize, startY)
               .lineTo(startX + i * cellSize, startY + gridHeight)
               .stroke();
            
            // 水平线
            doc.moveTo(startX, startY + i * cellSize)
               .lineTo(startX + gridWidth, startY + i * cellSize)
               .stroke();
        }
        
        // 填充字母
        doc.fontSize(Math.max(8, Math.min(12, cellSize * 0.4)))
           .font('Courier-Bold');
        
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const x = startX + col * cellSize + cellSize / 2;
                const y = startY + row * cellSize + cellSize / 2;
                
                // 获取字母
                const letter = puzzleData.grid[row][col];
                
                // 计算文本位置（居中）
                const textWidth = doc.widthOfString(letter);
                const textHeight = doc.heightOfString(letter);
                
                doc.text(letter, x - textWidth / 2, y - textHeight / 2);
            }
        }
        
        doc.moveDown(2);
        
        // 添加单词列表
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .text('Find these words:', { align: 'center' });
        
        doc.moveDown(0.5);
        
        // 计算每行显示的单词数量
        const wordsPerRow = Math.ceil(Math.sqrt(puzzleData.words.length));
        const wordList = puzzleData.words.map(w => w.word);
        
        // 按行显示单词
        for (let i = 0; i < wordList.length; i += wordsPerRow) {
            const rowWords = wordList.slice(i, i + wordsPerRow);
            const rowText = rowWords.join('    ');
            
            doc.fontSize(12)
               .font('Helvetica')
               .text(rowText, { align: 'center' });
        }
        
        doc.moveDown(1);
        
        // 添加页脚信息
        doc.fontSize(10)
           .font('Helvetica')
           .text(`Generated by WordSearch.sbs | ${puzzle.theme} theme | ${puzzle.difficulty} difficulty | ${gridSize}x${gridSize} grid`, { align: 'center' });
        
        // 完成PDF
        doc.end();
        
        return new Promise((resolve, reject) => {
            stream.on('finish', () => {
                console.log(`✅ 生成PDF: ${fileName}`);
                resolve(fileName);
            });
            
            stream.on('error', (error) => {
                console.error(`❌ PDF生成失败 ${fileName}:`, error);
                reject(error);
            });
        });
        
    } catch (error) {
        console.error(`❌ PDF生成失败 ${puzzle.slug}:`, error);
        throw error;
    }
}

// 生成所有PDF
async function generateAllPDFs() {
    console.log('📄 开始生成PDF文件...');
    
    // 确保downloads目录存在
    if (!fs.existsSync('./downloads')) {
        fs.mkdirSync('./downloads', { recursive: true });
    }
    
    const puzzleIndex = loadPuzzleIndex();
    if (!puzzleIndex) {
        console.error('无法加载拼图索引');
        return;
    }
    
    let successCount = 0;
    const promises = [];
    
    // 为每个拼图生成PDF
    for (const puzzle of puzzleIndex.puzzles) {
        try {
            const puzzleData = loadPuzzleData(puzzle.jsonFile);
            if (puzzleData) {
                const promise = generatePDF(puzzle, puzzleData)
                    .then(() => successCount++)
                    .catch(error => console.error(`PDF生成失败: ${puzzle.slug}`, error));
                
                promises.push(promise);
            }
        } catch (error) {
            console.error(`处理拼图失败 ${puzzle.slug}:`, error);
        }
    }
    
    // 等待所有PDF生成完成
    await Promise.allSettled(promises);
    
    console.log(`🎉 PDF生成完成! 成功生成 ${successCount} 个PDF文件`);
    
    // 生成PDF索引文件
    generatePDFIndex(puzzleIndex.puzzles);
}

// 生成PDF索引文件
function generatePDFIndex(puzzles) {
    console.log('📋 生成PDF索引...');
    
    const indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Download Word Search PDFs - WordSearch.sbs</title>
    <meta name="description" content="Download printable word search puzzles in PDF format. Free downloads for all themes and difficulty levels.">
    <link rel="stylesheet" href="../styles.css">
    <style>
        .pdf-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 2rem;
            margin: 2rem 0;
        }
        
        .pdf-card {
            background: white;
            border-radius: 15px;
            padding: 2rem;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            border: 2px solid transparent;
            text-align: center;
        }
        
        .pdf-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
            border-color: #3498db;
        }
        
        .pdf-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        
        .pdf-title {
            font-size: 1.3rem;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 1rem;
        }
        
        .pdf-info {
            color: #666;
            margin-bottom: 1.5rem;
            line-height: 1.6;
        }
        
        .difficulty-badges {
            display: flex;
            justify-content: center;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
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
        
        .download-btn {
            background: linear-gradient(45deg, #27ae60, #229954);
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 25px;
            text-decoration: none;
            font-weight: 600;
            display: inline-block;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .download-btn:hover {
            background: linear-gradient(45deg, #229954, #1e8449);
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(39, 174, 96, 0.4);
        }
        
        .play-btn {
            background: linear-gradient(45deg, #3498db, #2980b9);
            color: white;
            padding: 8px 16px;
            border: none;
            border-radius: 20px;
            text-decoration: none;
            font-weight: 600;
            display: inline-block;
            transition: all 0.3s ease;
            cursor: pointer;
            margin-left: 0.5rem;
            font-size: 14px;
        }
        
        .play-btn:hover {
            background: linear-gradient(45deg, #2980b9, #1f5f8b);
            transform: translateY(-1px);
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>📄 Download Word Search PDFs</h1>
            <p>Print and solve our puzzles offline!</p>
        </div>
    </header>

    <main class="container">
        <div class="pdf-grid">
            ${puzzles.map(puzzle => `
            <div class="pdf-card">
                <div class="pdf-icon">📄</div>
                <h3 class="pdf-title">${puzzle.title}</h3>
                <p class="pdf-info">${puzzle.theme.charAt(0).toUpperCase() + puzzle.theme.slice(1)} themed puzzle with ${puzzle.gridSize}x${puzzle.gridSize} grid</p>
                <div class="difficulty-badges">
                    <span class="difficulty-badge difficulty-${puzzle.difficulty}">${puzzle.difficulty}</span>
                </div>
                <a href="${puzzle.slug}.pdf" class="download-btn" download>📥 Download PDF</a>
                <a href="../play/${puzzle.slug}.html" class="play-btn">🎮 Play Online</a>
            </div>
            `).join('\n            ')}
        </div>
        
        <section style="text-align: center; margin: 3rem 0;">
            <h2>🖨️ Print and Solve Offline</h2>
            <div style="max-width: 600px; margin: 0 auto; color: #666; line-height: 1.6;">
                <p>Download our word search puzzles in PDF format for offline solving. Perfect for classrooms, travel, or when you want to solve puzzles without a screen.</p>
                <p>Each PDF includes the puzzle grid and word list, ready to print on standard A4 paper.</p>
            </div>
        </section>
    </main>

    <footer>
        <div class="container">
            <p>&copy; 2025 WordSearch.sbs - All rights reserved. | 
               <a href="../index.html" style="color: white;">Home</a> | 
               <a href="../play/" style="color: white;">Play Online</a>
            </p>
        </div>
    </footer>
</body>
</html>`;
    
    fs.writeFileSync('./downloads/index.html', indexHTML);
    console.log('✅ PDF索引页面生成完成: downloads/index.html');
}

// 主函数
async function main() {
    try {
        await generateAllPDFs();
    } catch (error) {
        console.error('PDF生成过程中发生错误:', error);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = {
    generateAllPDFs,
    generatePDF,
    generatePDFIndex
}; 