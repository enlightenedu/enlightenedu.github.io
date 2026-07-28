/**
 * 新闻索引生成脚本
 * 扫描 content/news/ 目录下所有 .md 文件，提取 frontmatter，生成 content/news.json
 * 由 GitHub Action 在每次新闻变更时自动调用
 */

const fs = require('fs');
const path = require('path');

const NEWS_DIR = path.join(__dirname, '..', 'content', 'news');
const OUTPUT_FILE = path.join(__dirname, '..', 'content', 'news.json');

// 简易 YAML frontmatter 解析器（无需额外依赖）
function parseFrontmatter(content) {
    const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
    if (!match) return null;

    const frontmatterStr = match[1];
    const body = match[2];
    const data = {};

    let currentKey = null;
    frontmatterStr.split('\n').forEach(line => {
        const kvMatch = line.match(/^(\w+):\s*(.*)$/);
        if (kvMatch) {
            currentKey = kvMatch[1];
            let value = kvMatch[2].trim();
            // 去掉引号
            value = value.replace(/^["']|["']$/g, '');
            data[currentKey] = value;
        }
    });

    data.body = body.trim();
    return data;
}

try {
    // 确保目录存在
    if (!fs.existsSync(NEWS_DIR)) {
        console.log('News directory does not exist, creating...');
        fs.mkdirSync(NEWS_DIR, { recursive: true });
    }

    // 扫描 .md 文件
    const files = fs.readdirSync(NEWS_DIR)
        .filter(f => f.endsWith('.md'))
        .sort()
        .reverse(); // 最新的在前

    console.log(`Found ${files.length} news files`);

    const newsList = [];

    files.forEach(filename => {
        const filePath = path.join(NEWS_DIR, filename);
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = parseFrontmatter(content);

        if (parsed && parsed.title) {
            newsList.push({
                slug: filename.replace(/\.md$/, ''),
                filename: filename,
                title: parsed.title || '',
                date: parsed.date || '',
                category: parsed.category || '公司新闻',
                summary: parsed.summary || '',
                image: parsed.image || '',
                // 正文不存进 JSON 以控制文件大小，前端按需加载
            });
            console.log(`  ✓ ${filename}: ${parsed.title}`);
        } else {
            console.log(`  ✗ ${filename}: failed to parse`);
        }
    });

    // 写入 JSON
    const json = JSON.stringify(newsList, null, 2);
    fs.writeFileSync(OUTPUT_FILE, json, 'utf-8');
    console.log(`\nGenerated ${OUTPUT_FILE} with ${newsList.length} articles`);

} catch (err) {
    console.error('Error building news index:', err.message);
    process.exit(1);
}
