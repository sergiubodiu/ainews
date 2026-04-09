const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function cleanText(text) {
  return text.trim().replace(/\u200b/g, ''); // remove zero-width spaces
}

async function extractAINewsIssue(url, outputDir = 'ainews_archive') {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log(`🌐 Loading: ${url}`);
  await page.goto(url, { waitUntil: 'networkidle' });

  // Wait for main content
  await page.waitForSelector('h1', { timeout: 15000 });

  const title = await page.locator('h1').first().innerText();

  // Intro blockquote
  let intro = '';
  const blockquote = page.locator('blockquote').first();
  if (await blockquote.count() > 0) {
    intro = await blockquote.innerText();
  }

  // Extract all relevant elements in order (better structure than raw text)
  const elements = await page.locator('h1, h2, h3, h4, p, blockquote, ul, ol, li').all();

  let markdownContent = '';
  let currentSection = '';

  for (const el of elements) {
    const tag = await el.evaluate(e => e.tagName.toLowerCase());
    let text = await cleanText(await el.innerText());

    if (!text) continue;

    if (tag.startsWith('h')) {
      const level = parseInt(tag[1]);
      if (currentSection) markdownContent += currentSection + '\n';
      currentSection = `${'#'.repeat(level)} ${text}\n\n`;
    } 
    else if (tag === 'p' || tag === 'blockquote') {
      currentSection += `${text}\n\n`;
    } 
    else if (tag === 'ul' || tag === 'ol') {
      // innerText on lists usually preserves bullets reasonably
      currentSection += `${text}\n\n`;
    } 
    else if (tag === 'li') {
      currentSection += `- ${text}\n`;
    }
  }

  if (currentSection) markdownContent += currentSection;

  // Build final Markdown
  const today = new Date().toISOString().split('T')[0];
  let slug = title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 100);

  const md = `# ${title}

**Source URL:** ${url}  
**Extracted on:** ${today}

${intro ? intro + '\n\n' : ''}

${markdownContent}
`;

  const filename = `${today}-${slug}.md`;
  const filepath = path.join(outputDir, filename);

  fs.writeFileSync(filepath, md, 'utf-8');

  console.log(`✅ Saved: ${filepath}`);

  await browser.close();
  return filepath;
}

// ======================
// Run the script
// ======================

(async () => {
  let targetUrl;

  if (process.argv[2]) {
    targetUrl = process.argv[2];
  } else {
    console.log("No URL provided → fetching latest issue from homepage...");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://ainews-web-2025.vercel.app/', { waitUntil: 'networkidle' });

    const latestLink = page.locator('a[href^="/issues/"]').first();
    if (await latestLink.count() > 0) {
      const href = await latestLink.getAttribute('href');
      targetUrl = `https://ainews-web-2025.vercel.app${href}`;
      console.log(`Latest issue: ${targetUrl}`);
    } else {
      targetUrl = 'https://ainews-web-2025.vercel.app/issues/26-04-08-not-much'; // fallback
    }
    await browser.close();
  }

  await extractAINewsIssue(targetUrl);
})();
