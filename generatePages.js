/**
 * 模板变量替换系统
 * 为每个拼图生成独立的信息页面
 */

const fs = require('fs');
const path = require('path');

// 读取模板文件
function loadTemplate() {
    try {
        const templatePath = './template.html';
        return fs.readFileSync(templatePath, 'utf-8');
    } catch (error) {
        console.error('读取模板失败:', error);
        return null;
    }
}

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

// 生成相关链接
function generateRelatedLinks(currentPuzzle, allPuzzles) {
    const related = allPuzzles.filter(puzzle => 
        puzzle.theme === currentPuzzle.theme && puzzle.slug !== currentPuzzle.slug
    ).slice(0, 5);
    
    if (related.length === 0) {
        // 如果同主题没有其他拼图，则选择其他主题的
        const others = allPuzzles.filter(puzzle => 
            puzzle.slug !== currentPuzzle.slug
        ).slice(0, 5);
        return others.map(puzzle => 
            `<li><a href="${puzzle.slug}.html">${puzzle.title}</a></li>`
        ).join('\n                ');
    }
    
    return related.map(puzzle => 
        `<li><a href="${puzzle.slug}.html">${puzzle.title}</a></li>`
    ).join('\n                ');
}

// 获取长尾关键词
function generateLongTailKeywords(puzzle, puzzleData) {
    const baseKeywords = [
        `${puzzle.theme} word search`,
        `${puzzle.difficulty} word puzzle`,
        `${puzzle.theme} puzzle game`,
        `word search ${puzzle.difficulty}`,
        `free ${puzzle.theme} puzzle`,
        `online word search`,
        `${puzzle.theme} vocabulary`,
        `printable word search`,
        `${puzzle.theme} brain game`
    ];
    
    // 添加拼图中的实际单词作为关键词
    if (puzzleData && puzzleData.words) {
        const wordKeywords = puzzleData.words
            .map(w => w.word.toLowerCase())
            .slice(0, 10);
        baseKeywords.push(...wordKeywords);
    }
    
    return baseKeywords.join(', ');
}

// 生成 FAQ HTML
function generateFaqHtml(puzzle) {
    const themeTitle = puzzle.theme.charAt(0).toUpperCase() + puzzle.theme.slice(1);
    return `
            <div class="faq-item">
                <h3>What is the goal of this ${themeTitle} word search?</h3>
                <p>Find all hidden ${puzzle.theme} related words in the ${puzzle.gridSize}x${puzzle.gridSize} grid. Words can be placed horizontally, vertically, or diagonally, forwards or backwards.</p>
            </div>
            <div class="faq-item">
                <h3>Is this puzzle suitable for ${puzzle.difficulty} level?</h3>
                <p>Yes. This puzzle is designed for the ${puzzle.difficulty} difficulty level and is great for practicing vocabulary and pattern recognition.</p>
            </div>
            <div class="faq-item">
                <h3>Can I download and print this puzzle?</h3>
                <p>Absolutely. Use the PDF download link above to print the puzzle and solve it offline.</p>
            </div>`;
}

// 生成 FAQ JSON-LD
function generateFaqJsonLd(puzzle) {
    const faqs = [
        {
            question: `What is the goal of this ${puzzle.theme} word search?`,
            answer: `Find all hidden ${puzzle.theme} related words in the ${puzzle.gridSize}x${puzzle.gridSize} grid. Words can be placed horizontally, vertically, or diagonally, forwards or backwards.`
        },
        {
            question: `Is this puzzle suitable for ${puzzle.difficulty} level?`,
            answer: `Yes. This puzzle is designed for the ${puzzle.difficulty} difficulty level and is great for practicing vocabulary and pattern recognition.`
        },
        {
            question: 'Can I download and print this puzzle?',
            answer: 'Absolutely. Use the PDF download link above to print the puzzle and solve it offline.'
        }
    ];
    return JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map(f => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer }
        }))
    });
}

// 生成面包屑 HTML
function generateBreadcrumbHtml(puzzle) {
    const themeTitle = puzzle.theme.charAt(0).toUpperCase() + puzzle.theme.slice(1);
    return `
            <nav aria-label="breadcrumb" class="breadcrumb">
                <ol>
                    <li><a href="/">Home</a></li>
                    <li><a href="/play/">Play</a></li>
                    <li><a href="/play/?theme=${puzzle.theme}">${themeTitle}</a></li>
                    <li aria-current="page">${puzzle.title}</li>
                </ol>
            </nav>`;
}

// 生成面包屑 JSON-LD
function generateBreadcrumbJsonLd(puzzle) {
    const themeTitle = puzzle.theme.charAt(0).toUpperCase() + puzzle.theme.slice(1);
    const baseUrl = 'https://wordsearch.sbs';
    return JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: 'Home', item: `${baseUrl}/` },
            { "@type": "ListItem", position: 2, name: 'Play', item: `${baseUrl}/play/` },
            { "@type": "ListItem", position: 3, name: themeTitle, item: `${baseUrl}/play/?theme=${puzzle.theme}` },
            { "@type": "ListItem", position: 4, name: puzzle.title, item: `${baseUrl}/${puzzle.slug}.html` }
        ]
    });
}

// 生成 Game JSON-LD
function generateGameJsonLd(puzzle, puzzleData) {
    const baseUrl = 'https://wordsearch.sbs';
    return JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Game",
        name: puzzle.title,
        description: `Play a ${puzzle.difficulty} ${puzzle.theme} word search with ${puzzleData && puzzleData.words ? puzzleData.words.length : ''} words in a ${puzzle.gridSize}x${puzzle.gridSize} grid.`,
        url: `${baseUrl}/${puzzle.slug}.html`,
        image: `${baseUrl}/images/${puzzle.image}`,
        gamePlatform: 'Web',
        genre: 'Word Search',
        keywords: generateLongTailKeywords(puzzle, puzzleData)
    });
}

// 生成关于段落
function generateAboutParagraph(puzzle, puzzleData) {
    const themeDescriptions = {
        animals: `This ${puzzle.difficulty} difficulty animal word search puzzle features ${puzzleData ? puzzleData.words.length : 'various'} carefully selected animal names. Perfect for nature lovers, students, and anyone looking to expand their wildlife vocabulary while having fun.`,
        food: `Explore the delicious world of food with this ${puzzle.difficulty} word search puzzle containing ${puzzleData ? puzzleData.words.length : 'various'} food-related terms. Great for cooking enthusiasts, food lovers, and vocabulary building.`,
        nature: `Connect with the natural world through this ${puzzle.difficulty} nature-themed word search. Find ${puzzleData ? puzzleData.words.length : 'various'} words related to plants, landscapes, and natural phenomena.`,
        school: `Educational and engaging, this ${puzzle.difficulty} school-themed word search includes ${puzzleData ? puzzleData.words.length : 'various'} academic terms. Perfect for students, teachers, and lifelong learners.`,
        sports: `Get your game on with this ${puzzle.difficulty} sports word search puzzle featuring ${puzzleData ? puzzleData.words.length : 'various'} athletic terms and activities. Ideal for sports fans and fitness enthusiasts.`,
        colors: `Discover the colorful world of hues and shades with this ${puzzle.difficulty} color-themed puzzle containing ${puzzleData ? puzzleData.words.length : 'various'} color names and variations.`
    };
    
    return themeDescriptions[puzzle.theme] || 
           `This ${puzzle.difficulty} difficulty ${puzzle.theme} word search puzzle provides an engaging brain training experience with ${puzzleData ? puzzleData.words.length : 'various'} themed words to find.`;
}

// 替换模板变量
function replaceTemplateVariables(template, puzzle, puzzleData, relatedLinks) {
    const currentYear = 2025;
    
    const variables = {
        PAGE_TITLE: puzzle.title,
        META_DESCRIPTION: `Play ${puzzle.title} online for free. ${puzzle.difficulty.charAt(0).toUpperCase() + puzzle.difficulty.slice(1)} difficulty word search puzzle with ${puzzleData ? puzzleData.words.length : ''} ${puzzle.theme} themed words to find.`,
        LONG_TAIL_KEYWORDS: generateLongTailKeywords(puzzle, puzzleData),
        H1_TITLE: puzzle.title,
        PAGE_INTRO: `Challenge yourself with our ${puzzle.difficulty} difficulty ${puzzle.theme} word search puzzle. Find all the hidden words in this ${puzzle.gridSize}x${puzzle.gridSize} grid!`,
        SLUG: puzzle.slug,
        IMAGE_FILE: puzzle.image,
        PDF_FILE: `${puzzle.slug}.pdf`,
        ABOUT_PARAGRAPH: generateAboutParagraph(puzzle, puzzleData),
        RELATED_LINKS: relatedLinks,
        YEAR: currentYear.toString(),
        THEME: puzzle.theme.charAt(0).toUpperCase() + puzzle.theme.slice(1),
        DIFFICULTY: puzzle.difficulty.charAt(0).toUpperCase() + puzzle.difficulty.slice(1),
        GRID_SIZE: `${puzzle.gridSize}x${puzzle.gridSize}`,
        WORDS_LIST: (puzzleData && Array.isArray(puzzleData.words)) 
            ? puzzleData.words.map(w => `<li>${w.word}</li>`).join('\n                ')
            : '',
        // FAQ
        FAQ_HTML: generateFaqHtml(puzzle),
        FAQ_JSONLD: generateFaqJsonLd(puzzle),
        // Breadcrumb
        BREADCRUMB_HTML: generateBreadcrumbHtml(puzzle),
        BREADCRUMB_JSONLD: generateBreadcrumbJsonLd(puzzle),
        // Game JSON-LD
        GAME_JSONLD: generateGameJsonLd(puzzle, puzzleData),
        // Open Graph / Twitter
        OG_TITLE: puzzle.title,
        OG_DESCRIPTION: `Play ${puzzle.title} online for free. ${puzzle.difficulty.charAt(0).toUpperCase() + puzzle.difficulty.slice(1)} ${puzzle.theme} word search puzzle.`,
        OG_IMAGE: `https://wordsearch.sbs/images/${puzzle.image}`,
        OG_URL: `https://wordsearch.sbs/${puzzle.slug}.html`
    };
    
    let result = template;
    
    // 替换所有模板变量
    Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, variables[key]);
    });
    
    return result;
}

// 生成单个页面
function generatePage(puzzle, template, allPuzzles) {
    try {
        // 加载拼图数据
        const puzzleData = loadPuzzleData(puzzle.jsonFile);
        
        // 生成相关链接
        const relatedLinks = generateRelatedLinks(puzzle, allPuzzles);
        
        // 替换模板变量
        const pageContent = replaceTemplateVariables(template, puzzle, puzzleData, relatedLinks);
        
        // 写入文件
        const fileName = `${puzzle.slug}.html`;
        fs.writeFileSync(fileName, pageContent);
        
        console.log(`✅ 生成页面: ${fileName}`);
        return true;
        
    } catch (error) {
        console.error(`❌ 生成页面失败 ${puzzle.slug}:`, error.message);
        return false;
    }
}

// 生成所有页面
function generateAllPages() {
    console.log('📄 开始生成拼图信息页面...');
    
    // 加载模板和数据
    const template = loadTemplate();
    if (!template) {
        console.error('无法加载模板文件');
        return;
    }
    
    const puzzleIndex = loadPuzzleIndex();
    if (!puzzleIndex) {
        console.error('无法加载拼图索引');
        return;
    }
    
    let successCount = 0;
    
    // 为每个拼图生成页面
    puzzleIndex.puzzles.forEach(puzzle => {
        if (generatePage(puzzle, template, puzzleIndex.puzzles)) {
            successCount++;
        }
    });
    
    console.log(`🎉 页面生成完成! 成功生成 ${successCount} 个页面`);
    
    // 生成网站地图
    generateSitemap(puzzleIndex.puzzles);
    
    // 生成robots.txt
    generateRobotsTxt();
}

// 生成网站地图
function generateSitemap(puzzles) {
    console.log('🗺️ 生成网站地图...');
    
    const baseUrl = 'https://wordsearch.sbs';
    const currentDate = '2025-08-13';
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${baseUrl}/</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${baseUrl}/play/</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>`;
    
    // 添加每个拼图页面
    puzzles.forEach(puzzle => {
        sitemap += `
    <url>
        <loc>${baseUrl}/${puzzle.slug}.html</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>${baseUrl}/play/${puzzle.slug}.html</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>`;
    });
    
    sitemap += '\n</urlset>';
    
    fs.writeFileSync('sitemap.xml', sitemap);
    console.log('✅ 网站地图生成完成: sitemap.xml');
}

// 生成robots.txt
function generateRobotsTxt() {
    console.log('🤖 生成robots.txt...');
    
    const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: https://wordsearch.sbs/sitemap.xml

# Optimize crawling
Crawl-delay: 1

# Block unnecessary paths
Disallow: /puzzles/
Disallow: /generatePuzzles.js
Disallow: /generateGamePages.js
Disallow: /generatePages.js
Disallow: /wordSearchGenerator.js
Disallow: *.json$
`;
    
    fs.writeFileSync('robots.txt', robotsTxt);
    console.log('✅ robots.txt 生成完成');
}

// 生成页面预览
function generatePreview() {
    console.log('👀 生成页面预览...');
    
    const puzzleIndex = loadPuzzleIndex();
    if (!puzzleIndex) return;
    
    // 选择第一个拼图作为预览
    const samplePuzzle = puzzleIndex.puzzles[0];
    const template = loadTemplate();
    
    if (template && samplePuzzle) {
        const puzzleData = loadPuzzleData(samplePuzzle.jsonFile);
        const relatedLinks = generateRelatedLinks(samplePuzzle, puzzleIndex.puzzles);
        const previewContent = replaceTemplateVariables(template, samplePuzzle, puzzleData, relatedLinks);
        
        fs.writeFileSync('preview.html', previewContent);
        console.log(`✅ 生成预览页面: preview.html (基于 ${samplePuzzle.title})`);
        
        // 显示变量替换结果
        console.log('\n📋 模板变量示例:');
        console.log(`- PAGE_TITLE: ${samplePuzzle.title}`);
        console.log(`- THEME: ${samplePuzzle.theme}`);
        console.log(`- DIFFICULTY: ${samplePuzzle.difficulty}`);
        console.log(`- GRID_SIZE: ${samplePuzzle.gridSize}x${samplePuzzle.gridSize}`);
        if (puzzleData && puzzleData.words) {
            console.log(`- WORD_COUNT: ${puzzleData.words.length}`);
            console.log(`- SAMPLE_WORDS: ${puzzleData.words.slice(0, 5).map(w => w.word).join(', ')}`);
        }
    }
}

// 主函数
function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--preview')) {
        generatePreview();
    } else {
        generateAllPages();
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = {
    generateAllPages,
    generatePage,
    generatePreview,
    replaceTemplateVariables
};