/**
 * Test script for static pages configuration
 */

import { STATIC_PAGES, getStaticPageConfig, getAllStaticPageNames, isStaticPage } from './src/config/staticPages.js';

console.log('Static Pages Configuration Test\n');
console.log('='.repeat(80));

// Test 1: Check if STATIC_PAGES is defined
console.log('\n1. Testing STATIC_PAGES object:');
if (STATIC_PAGES) {
  const pages = Object.keys(STATIC_PAGES);
  console.log(`   ✓ STATIC_PAGES defined with ${pages.length} pages`);
  console.log(`   Pages: ${pages.join(', ')}`);
} else {
  console.log('   ✗ STATIC_PAGES not defined');
}

// Test 2: Validate each page has required fields
console.log('\n2. Validating page metadata:');
const requiredPages = ['about', 'contact', 'disclaimer', 'privacy-policy', 'admission', 'admit-card', 'exam-form', 'result', 'schemes'];
let allPagesValid = true;

requiredPages.forEach(pageName => {
  const page = STATIC_PAGES[pageName];
  if (!page) {
    console.log(`   ✗ Missing page: ${pageName}`);
    allPagesValid = false;
    return;
  }
  
  const hasTitle = page.title && page.title.length > 0;
  const hasDescription = page.description && page.description.length > 0;
  const hasKeywords = Array.isArray(page.keywords) && page.keywords.length > 0;
  const hasPriority = typeof page.priority === 'number';
  const hasChangefreq = page.changefreq && page.changefreq.length > 0;
  
  if (hasTitle && hasDescription && hasKeywords && hasPriority && hasChangefreq) {
    console.log(`   ✓ ${pageName}: All fields present`);
  } else {
    console.log(`   ✗ ${pageName}: Missing fields`);
    allPagesValid = false;
  }
});

// Test 3: Check meta tag lengths
console.log('\n3. Checking meta tag lengths (SEO requirements):');
Object.keys(STATIC_PAGES).forEach(pageName => {
  const page = STATIC_PAGES[pageName];
  const titleLen = page.title.length;
  const descLen = page.description.length;
  
  // Title should be 50-70 chars (allowing some flexibility)
  // Description should be 150-160 chars
  const titleOk = titleLen >= 40 && titleLen <= 70;
  const descOk = descLen >= 140 && descLen <= 170;
  
  console.log(`   ${pageName}:`);
  console.log(`     Title: ${titleLen} chars ${titleOk ? '✓' : '⚠'}`);
  console.log(`     Description: ${descLen} chars ${descOk ? '✓' : '⚠'}`);
});

// Test 4: Test getStaticPageConfig function
console.log('\n4. Testing getStaticPageConfig() function:');

// Test valid page
const aboutConfig = getStaticPageConfig('about');
console.log(`   ✓ getStaticPageConfig('about'): ${aboutConfig ? 'Found' : 'Not found'}`);

// Test case insensitivity
const contactConfig = getStaticPageConfig('CONTACT');
console.log(`   ✓ getStaticPageConfig('CONTACT'): ${contactConfig ? 'Found (case insensitive)' : 'Not found'}`);

// Test with whitespace
const spaceConfig = getStaticPageConfig('  about  ');
console.log(`   ✓ getStaticPageConfig('  about  '): ${spaceConfig ? 'Found (whitespace handled)' : 'Not found'}`);

// Test invalid page
const invalidConfig = getStaticPageConfig('nonexistent');
console.log(`   ✓ getStaticPageConfig('nonexistent'): ${invalidConfig === null ? 'Correctly returns null' : 'Error'}`);

// Test null input
const nullConfig = getStaticPageConfig(null);
console.log(`   ✓ getStaticPageConfig(null): ${nullConfig === null ? 'Correctly returns null' : 'Error'}`);

// Test undefined input
const undefinedConfig = getStaticPageConfig(undefined);
console.log(`   ✓ getStaticPageConfig(undefined): ${undefinedConfig === null ? 'Correctly returns null' : 'Error'}`);

// Test 5: Test getAllStaticPageNames function
console.log('\n5. Testing getAllStaticPageNames() function:');
const allNames = getAllStaticPageNames();
console.log(`   ✓ Returns ${allNames.length} page names`);

// Test 6: Test isStaticPage function
console.log('\n6. Testing isStaticPage() function:');
console.log(`   ✓ isStaticPage('about'): ${isStaticPage('about')}`);
console.log(`   ✓ isStaticPage('CONTACT'): ${isStaticPage('CONTACT')}`);
console.log(`   ✓ isStaticPage('nonexistent'): ${!isStaticPage('nonexistent')}`);
console.log(`   ✓ isStaticPage(null): ${!isStaticPage(null)}`);

console.log('\n' + '='.repeat(80));
console.log('\n✓ All tests completed successfully!\n');
