/**
 * Manual test script for sitemap generator
 * Run with: node src/scripts/testSitemapGenerator.js
 */

import { formatSitemapEntry, generateStaticPageSitemapEntries } from '../utils/seo/sitemapGenerator.js';

console.log('=== Testing Sitemap Generator ===\n');

// Test 1: formatSitemapEntry
console.log('Test 1: formatSitemapEntry with complete data');
const entry1 = {
  loc: 'https://sarkaripulse.net/job/test-job',
  lastmod: '2024-01-15',
  changefreq: 'daily',
  priority: 0.8
};
const xml1 = formatSitemapEntry(entry1);
console.log(xml1);
console.log('✓ Should contain <url>, <loc>, <lastmod>, <changefreq>, <priority>\n');

// Test 2: formatSitemapEntry with only loc
console.log('Test 2: formatSitemapEntry with only loc');
const entry2 = {
  loc: 'https://sarkaripulse.net/about'
};
const xml2 = formatSitemapEntry(entry2);
console.log(xml2);
console.log('✓ Should contain only <url> and <loc>\n');

// Test 3: formatSitemapEntry with special characters
console.log('Test 3: formatSitemapEntry with XML special characters');
const entry3 = {
  loc: 'https://sarkaripulse.net/job?id=1&category=test'
};
const xml3 = formatSitemapEntry(entry3);
console.log(xml3);
console.log('✓ Should escape & to &amp;\n');

// Test 4: formatSitemapEntry without loc
console.log('Test 4: formatSitemapEntry without loc (should return empty)');
const entry4 = {
  lastmod: '2024-01-15',
  changefreq: 'daily'
};
const xml4 = formatSitemapEntry(entry4);
console.log(`Result: "${xml4}"`);
console.log('✓ Should return empty string\n');

// Test 5: generateStaticPageSitemapEntries
console.log('Test 5: generateStaticPageSitemapEntries');
const staticEntries = generateStaticPageSitemapEntries();
console.log(`Generated ${staticEntries.length} static page entries:`);
staticEntries.forEach(entry => {
  console.log(`  - ${entry.loc} (priority: ${entry.priority}, changefreq: ${entry.changefreq})`);
});
console.log('✓ Should include homepage and all static pages\n');

// Test 6: Check homepage entry
console.log('Test 6: Verify homepage entry');
const homepage = staticEntries.find(e => e.loc === 'https://sarkaripulse.net');
if (homepage) {
  console.log('Homepage entry found:');
  console.log(`  - URL: ${homepage.loc}`);
  console.log(`  - Priority: ${homepage.priority}`);
  console.log(`  - Change frequency: ${homepage.changefreq}`);
  console.log('✓ Homepage should have priority 1.0 and changefreq "daily"\n');
} else {
  console.log('✗ Homepage entry not found!\n');
}

// Test 7: Check about page entry
console.log('Test 7: Verify about page entry');
const aboutPage = staticEntries.find(e => e.loc.includes('/about'));
if (aboutPage) {
  console.log('About page entry found:');
  console.log(`  - URL: ${aboutPage.loc}`);
  console.log(`  - Priority: ${aboutPage.priority}`);
  console.log(`  - Change frequency: ${aboutPage.changefreq}`);
  console.log('✓ About page should have priority 0.7 and changefreq "monthly"\n');
} else {
  console.log('✗ About page entry not found!\n');
}

console.log('=== All manual tests completed ===');
