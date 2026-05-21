#!/usr/bin/env node

/**
 * Verification script for SEO environment configuration
 * This script verifies that all SEO-related environment variables are loaded correctly
 */

import { env } from '../config/env.js';

console.log('🔍 Verifying SEO Configuration...\n');

const tests = [
  {
    name: 'BASE_URL',
    value: env.baseUrl,
    expected: 'https://sarkaripulse.net',
    type: 'string',
    validate: (val) => val && val.startsWith('https://') && !val.endsWith('/')
  },
  {
    name: 'SITEMAP_CACHE_TTL',
    value: env.sitemapCacheTtl,
    expected: 3600,
    type: 'number',
    validate: (val) => typeof val === 'number' && val >= 60
  },
  {
    name: 'STRUCTURED_DATA_CACHE_TTL',
    value: env.structuredDataCacheTtl,
    expected: 3600,
    type: 'number',
    validate: (val) => typeof val === 'number' && val >= 60
  },
  {
    name: 'META_TAG_CACHE_TTL',
    value: env.metaTagCacheTtl,
    expected: 1800,
    type: 'number',
    validate: (val) => typeof val === 'number' && val >= 60
  },
  {
    name: 'ENABLE_SEO_VALIDATION',
    value: env.enableSeoValidation,
    expected: true,
    type: 'boolean',
    validate: (val) => typeof val === 'boolean'
  }
];

let passed = 0;
let failed = 0;

tests.forEach(test => {
  const typeMatch = typeof test.value === test.type;
  const valueMatch = test.value === test.expected;
  const validationPass = test.validate(test.value);
  
  if (typeMatch && validationPass) {
    console.log(`✅ ${test.name}`);
    console.log(`   Value: ${test.value}`);
    console.log(`   Type: ${test.type}`);
    if (valueMatch) {
      console.log(`   Matches expected: ${test.expected}`);
    }
    console.log('');
    passed++;
  } else {
    console.log(`❌ ${test.name}`);
    console.log(`   Value: ${test.value}`);
    console.log(`   Expected: ${test.expected}`);
    console.log(`   Type: ${typeof test.value} (expected: ${test.type})`);
    console.log(`   Type Match: ${typeMatch}`);
    console.log(`   Validation Pass: ${validationPass}`);
    console.log('');
    failed++;
  }
});

console.log('─'.repeat(50));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  console.log('❌ SEO configuration verification failed!');
  process.exit(1);
} else {
  console.log('✅ All SEO configuration tests passed!');
  console.log('\n📝 Summary:');
  console.log(`   - Base URL: ${env.baseUrl}`);
  console.log(`   - Sitemap Cache TTL: ${env.sitemapCacheTtl}s (${env.sitemapCacheTtl / 60} minutes)`);
  console.log(`   - Structured Data Cache TTL: ${env.structuredDataCacheTtl}s (${env.structuredDataCacheTtl / 60} minutes)`);
  console.log(`   - Meta Tag Cache TTL: ${env.metaTagCacheTtl}s (${env.metaTagCacheTtl / 60} minutes)`);
  console.log(`   - SEO Validation Enabled: ${env.enableSeoValidation}`);
  process.exit(0);
}
