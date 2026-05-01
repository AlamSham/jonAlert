#!/usr/bin/env node

/**
 * Quick Test Script - Check if setup is ready
 */

import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 Checking Facebook Setup...\n');

const checks = [
  { name: 'META_PAGE_ID', value: process.env.META_PAGE_ID, required: true },
  { name: 'META_APP_ID', value: process.env.META_APP_ID, required: true },
  { name: 'META_APP_SECRET', value: process.env.META_APP_SECRET, required: true },
  { name: 'META_GRAPH_VERSION', value: process.env.META_GRAPH_VERSION, required: true },
];

let allGood = true;

checks.forEach(check => {
  if (check.required && !check.value) {
    console.log(`❌ ${check.name}: NOT SET`);
    allGood = false;
  } else if (check.value) {
    const displayValue = check.name.includes('SECRET') 
      ? `${String(check.value).substring(0, 10)}...` 
      : check.value;
    console.log(`✅ ${check.name}: ${displayValue}`);
  }
});

console.log('\n' + '='.repeat(50));

if (allGood) {
  console.log('✅ ALL CHECKS PASSED!');
  console.log('\n📝 Next Steps:');
  console.log('1. Run: npm run setup:facebook-token');
  console.log('2. Follow the interactive prompts');
  console.log('3. Get short-lived token from Graph API Explorer');
  console.log('4. Paste when prompted');
  console.log('5. Done! Token will never expire ✨');
  process.exit(0);
} else {
  console.log('❌ SETUP INCOMPLETE');
  console.log('\n📝 Please add missing values to .env file');
  process.exit(1);
}
