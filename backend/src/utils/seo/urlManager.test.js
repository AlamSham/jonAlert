#!/usr/bin/env node

/**
 * Manual test script for URL Manager
 * Run with: node src/utils/seo/urlManager.test.js
 */

import {
  generateSlug,
  normalizeUrl,
  getCanonicalUrl,
  buildJobUrl,
  buildSchemeUrl,
  buildCategoryUrl,
  BASE_URL,
  MAX_SLUG_LENGTH
} from './urlManager.js';

console.log('🧪 Testing URL Manager Module\n');
console.log('='.repeat(60));

let passedTests = 0;
let failedTests = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`✅ ${description}`);
    passedTests++;
  } catch (error) {
    console.log(`❌ ${description}`);
    console.log(`   Error: ${error.message}`);
    failedTests++;
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}\n   Expected: ${expected}\n   Actual: ${actual}`);
  }
}

function assertTruthy(value, message) {
  if (!value) {
    throw new Error(message);
  }
}

// Test generateSlug
console.log('\n📝 Testing generateSlug()');
console.log('-'.repeat(60));

test('Should generate slug from simple title', () => {
  const slug = generateSlug('Railway Recruitment 2024');
  assertEqual(slug, 'railway-recruitment-2024', 'Slug should be lowercase with hyphens');
});

test('Should remove stop words', () => {
  const slug = generateSlug('The Latest Railway Recruitment for 2024');
  // Should remove 'the', 'latest', 'for'
  assertTruthy(!slug.includes('the') && !slug.includes('latest'), 'Stop words should be removed');
});

test('Should handle special characters', () => {
  const slug = generateSlug('Railway Recruitment @ 2024 - Apply Now!');
  assertTruthy(!slug.includes('@') && !slug.includes('!'), 'Special characters should be removed');
});

test('Should limit slug length to max', () => {
  const longTitle = 'A'.repeat(150);
  const slug = generateSlug(longTitle);
  assertTruthy(slug.length <= MAX_SLUG_LENGTH, `Slug should not exceed ${MAX_SLUG_LENGTH} characters`);
});

test('Should handle empty string', () => {
  const slug = generateSlug('');
  assertEqual(slug, '', 'Empty string should return empty slug');
});

test('Should handle null/undefined', () => {
  const slug1 = generateSlug(null);
  const slug2 = generateSlug(undefined);
  assertEqual(slug1, '', 'Null should return empty slug');
  assertEqual(slug2, '', 'Undefined should return empty slug');
});

// Test normalizeUrl
console.log('\n📝 Testing normalizeUrl()');
console.log('-'.repeat(60));

test('Should remove trailing slash', () => {
  const url = normalizeUrl('https://example.com/path/');
  assertEqual(url, 'https://example.com/path', 'Trailing slash should be removed');
});

test('Should keep root slash', () => {
  const url = normalizeUrl('https://example.com/');
  assertEqual(url, 'https://example.com/', 'Root slash should be kept');
});

test('Should handle multiple trailing slashes', () => {
  const url = normalizeUrl('https://example.com/path///');
  assertEqual(url, 'https://example.com/path', 'Multiple trailing slashes should be removed');
});

test('Should handle empty string', () => {
  const url = normalizeUrl('');
  assertEqual(url, '', 'Empty string should return empty string');
});

// Test getCanonicalUrl
console.log('\n📝 Testing getCanonicalUrl()');
console.log('-'.repeat(60));

test('Should generate canonical URL with path', () => {
  const url = getCanonicalUrl('/job/railway-recruitment-2024');
  assertEqual(url, `${BASE_URL}/job/railway-recruitment-2024`, 'Should combine base URL with path');
});

test('Should handle path without leading slash', () => {
  const url = getCanonicalUrl('job/railway-recruitment-2024');
  assertEqual(url, `${BASE_URL}/job/railway-recruitment-2024`, 'Should add leading slash');
});

test('Should handle query parameters when specified', () => {
  const url = getCanonicalUrl('/jobs', {
    includeQueryParams: true,
    queryParams: { state: 'delhi', category: 'government' }
  });
  assertTruthy(url.includes('state=delhi'), 'Should include query parameters');
  assertTruthy(url.includes('category=government'), 'Should include all query parameters');
});

test('Should not include query params by default', () => {
  const url = getCanonicalUrl('/jobs', {
    queryParams: { state: 'delhi' }
  });
  assertTruthy(!url.includes('?'), 'Should not include query params without flag');
});

test('Should handle empty path', () => {
  const url = getCanonicalUrl('');
  assertEqual(url, BASE_URL, 'Empty path should return base URL');
});

// Test buildJobUrl
console.log('\n📝 Testing buildJobUrl()');
console.log('-'.repeat(60));

test('Should build job URL with existing slug', () => {
  const job = {
    title: 'Railway Recruitment 2024',
    slug: 'railway-recruitment-2024'
  };
  const url = buildJobUrl(job);
  assertEqual(url, `${BASE_URL}/job/railway-recruitment-2024`, 'Should use existing slug');
});

test('Should generate slug if not present', () => {
  const job = {
    title: 'Railway Recruitment 2024'
  };
  const url = buildJobUrl(job);
  assertTruthy(url.includes('/job/'), 'Should include /job/ path');
  assertTruthy(url.includes('railway'), 'Should generate slug from title');
});

test('Should handle null job', () => {
  const url = buildJobUrl(null);
  assertEqual(url, BASE_URL, 'Null job should return base URL');
});

// Test buildSchemeUrl
console.log('\n📝 Testing buildSchemeUrl()');
console.log('-'.repeat(60));

test('Should build scheme URL with existing slug', () => {
  const scheme = {
    title: 'PM Kisan Samman Nidhi',
    slug: 'pm-kisan-samman-nidhi'
  };
  const url = buildSchemeUrl(scheme);
  assertEqual(url, `${BASE_URL}/scheme/pm-kisan-samman-nidhi`, 'Should use existing slug');
});

test('Should generate slug if not present', () => {
  const scheme = {
    title: 'PM Kisan Samman Nidhi'
  };
  const url = buildSchemeUrl(scheme);
  assertTruthy(url.includes('/scheme/'), 'Should include /scheme/ path');
  assertTruthy(url.includes('pm-kisan'), 'Should generate slug from title');
});

// Test buildCategoryUrl
console.log('\n📝 Testing buildCategoryUrl()');
console.log('-'.repeat(60));

test('Should build category URL without filters', () => {
  const url = buildCategoryUrl('jobs');
  assertEqual(url, `${BASE_URL}/jobs`, 'Should build simple category URL');
});

test('Should build category URL with filters', () => {
  const url = buildCategoryUrl('jobs', { state: 'delhi', qualification: 'graduate' });
  assertTruthy(url.includes('state=delhi'), 'Should include state filter');
  assertTruthy(url.includes('qualification=graduate'), 'Should include qualification filter');
});

test('Should filter out empty values', () => {
  const url = buildCategoryUrl('jobs', { state: 'delhi', qualification: '' });
  assertTruthy(url.includes('state=delhi'), 'Should include non-empty values');
  assertTruthy(!url.includes('qualification'), 'Should exclude empty values');
});

test('Should handle empty category', () => {
  const url = buildCategoryUrl('');
  assertEqual(url, BASE_URL, 'Empty category should return base URL');
});

// Summary
console.log('\n' + '='.repeat(60));
console.log(`\n📊 Test Results:`);
console.log(`   ✅ Passed: ${passedTests}`);
console.log(`   ❌ Failed: ${failedTests}`);
console.log(`   📈 Total: ${passedTests + failedTests}`);

if (failedTests === 0) {
  console.log('\n🎉 All tests passed!');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Please review the errors above.');
  process.exit(1);
}
