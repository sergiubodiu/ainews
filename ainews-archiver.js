const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const TurndownService = require('turndown');

function extractDateFromUrl(url) {
  // Match patterns like 26-03-05, 26-04-01, etc.
  const match = url.match(/26-(\d{2})-(\d{2})/);
  if (match) {
    const month = match[1];
    const day = match[2];
    return `2026-${month}-${day}`;
  }
  // Fallback: use today's date
  return new Date().toISOString().split('T')[0];
}

async function extractAndConvertToMarkdown(url, outputDir = 'archive') {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log(`🌐 Loading: ${url}`);
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForSelector('h1', { timeout: 20000 });

  const pageTitle = (await page.locator('h1').first().innerText()).trim();

  // Extract date from URL (preferred) or fallback
  const issueDate = extractDateFromUrl(url);

  // Extract HTML between first <hr> and "AI Discords"
  const rawHTML = await page.evaluate(() => {
    const hrs = document.querySelectorAll('hr');
    if (hrs.length === 0) return document.body.innerHTML;

    const firstHr = hrs[0];
    let current = firstHr.nextElementSibling;
    let htmlBlocks = [];

    while (current) {
      const text = (current.innerText || '').toLowerCase();

      // Stop before AI Discords section
      if (text.includes('ai discords') || text.includes('discord')) {
        break;
      }

      // Collect useful elements
      if (current.tagName.match(/^(H1|H2|P|UL|OL|BLOCKQUOTE|DIV)$/i)) {
        htmlBlocks.push(current.outerHTML);
      }
      current = current.nextElementSibling;
    }
    return htmlBlocks.join('\n');
  });

  // === Turndown Setup with custom rules ===
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
  });

  // Custom rule: Convert thematic bold paragraphs into ## headings
  turndownService.addRule('thematicHeading', {
    filter: function (node) {
      return node.nodeName === 'P' &&
        node.querySelector('strong') &&
        node.innerText.length > 35 &&
        node.innerText.length < 140;
    },
    replacement: function (content) {
      const clean = content.replace(/\*\*/g, '').trim();
      return `## ${clean}\n\n`;
    }
  });

  // Custom rule: Convert "**Title:**" style into ###
  turndownService.addRule('subHeading', {
    filter: function (node) {
      return node.nodeName === 'P' && /^\*\*[^*]{5,80}\*\*[:\s]/.test(node.innerText);
    },
    replacement: function (content) {
      const clean = content.replace(/\*\*/g, '').replace(/:\s*$/, '').trim();
      return `### ${clean}\n\n`;
    }
  });

  // Convert HTML to Markdown
  let markdown = turndownService.turndown(rawHTML);

  // Additional cleanup
  markdown = markdown
    .replace(/Apr \d+\s+not much happened today/gi, '')
    .replace(/show\/hide tags/gi, '')
    .replace(/### Companies[\s\S]*?### People[\s\S]*?/i, '')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();

  // Final Markdown with header
  const today = new Date().toISOString().split('T')[0];
  const slug = pageTitle.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 100);

  const finalMd = `# ${pageTitle}


${markdown}
`;

  const filename = `${issueDate}.md`;
  const filepath = path.join(outputDir, filename);

  fs.writeFileSync(filepath, finalMd, 'utf-8');

  console.log(`✅ Final clean Markdown saved: ${filepath}`);
  await browser.close();
}

(async () => {
  let targetUrl = process.argv[2];
  if (!targetUrl) {
    targetUrl = "https://ainews-web-2025.vercel.app/issues/26-04-08-not-much";
    console.log("No URL provided → using default issue");
  }

  await extractAndConvertToMarkdown(targetUrl);
})();