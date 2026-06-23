const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const htmlFiles = [];

// Helper to recursively find HTML files
function findHtmlFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && !file.startsWith('.')) {
        findHtmlFiles(filePath);
      }
    } else if (file.endsWith('.html')) {
      htmlFiles.push(filePath);
    }
  }
}

findHtmlFiles(rootDir);

console.log(`Scanning ${htmlFiles.length} HTML files for broken links and assets...`);
console.log('='.repeat(60));

let brokenLinksCount = 0;
let scannedLinksCount = 0;

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  
  // Extract href="..." and src="..."
  const regex = /href="([^"]+)"|src="([^"]+)"/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const link = match[1] || match[2];
    
    // Skip external, protocol, or anchor-only links
    if (!link || link.startsWith('http') || link.startsWith('mailto:') || link.startsWith('tel:') || link.startsWith('#')) {
      continue;
    }
    
    scannedLinksCount++;
    
    // Clean fragment identifiers
    const cleanLink = link.split('#')[0];
    if (!cleanLink) {
      continue;
    }
    
    // Resolve file paths
    let targetPath;
    if (cleanLink.startsWith('/')) {
      targetPath = path.join(rootDir, cleanLink.substring(1));
    } else {
      targetPath = path.join(path.dirname(file), cleanLink);
    }
    
    if (!fs.existsSync(targetPath)) {
      const relativeFile = path.relative(rootDir, file);
      console.log(`Broken link found in [${relativeFile}]:`);
      console.log(`  Attribute: ${match[0]}`);
      console.log(`  Target path: ${cleanLink} (Resolved: ${path.relative(rootDir, targetPath)})`);
      console.log('-'.repeat(40));
      brokenLinksCount++;
    }
  }
}

console.log('='.repeat(60));
console.log('Scan complete!');
console.log(`Total links checked: ${scannedLinksCount}`);
console.log(`Broken links found: ${brokenLinksCount}`);

if (brokenLinksCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
