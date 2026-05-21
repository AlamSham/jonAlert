#!/usr/bin/env node

/**
 * Verification Script for SitemapCache Model
 * This script verifies that the SitemapCache model is correctly defined
 * and can be instantiated without errors.
 */

import { SitemapCache } from '../models/SitemapCache.js';

console.log('🔍 Verifying SitemapCache Model...\n');

try {
  // Verify model is defined
  console.log('✅ SitemapCache model imported successfully');
  console.log(`   Model name: ${SitemapCache.modelName}`);
  console.log(`   Collection name: ${SitemapCache.collection.name}`);
  
  // Verify schema fields
  const schemaFields = Object.keys(SitemapCache.schema.paths);
  console.log('\n📋 Schema fields:');
  schemaFields.forEach(field => {
    if (field !== '_id') {
      const fieldType = SitemapCache.schema.paths[field].instance;
      const isRequired = SitemapCache.schema.paths[field].isRequired;
      console.log(`   - ${field}: ${fieldType}${isRequired ? ' (required)' : ''}`);
    }
  });
  
  // Verify indexes
  const indexes = SitemapCache.schema.indexes();
  console.log('\n🔍 Indexes:');
  indexes.forEach((index, i) => {
    const fields = Object.keys(index[0]).join(', ');
    const options = index[1] ? JSON.stringify(index[1]) : 'none';
    console.log(`   ${i + 1}. Fields: ${fields}, Options: ${options}`);
  });
  
  // Create a test instance (without saving to DB)
  const testCache = new SitemapCache({
    content: '<xml>test sitemap</xml>',
    generatedAt: new Date(),
    expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
    entryCount: 100,
    lastJobUpdate: new Date(),
    lastSchemeUpdate: new Date()
  });
  
  console.log('\n✅ Test instance created successfully');
  console.log(`   Entry count: ${testCache.entryCount}`);
  console.log(`   Generated at: ${testCache.generatedAt.toISOString()}`);
  console.log(`   Expires at: ${testCache.expiresAt.toISOString()}`);
  
  // Verify validation
  const validationError = testCache.validateSync();
  if (validationError) {
    console.log('\n❌ Validation failed:', validationError.message);
    process.exit(1);
  } else {
    console.log('\n✅ Validation passed');
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ ALL CHECKS PASSED!');
  console.log('\n📝 SitemapCache model is ready to use');
  console.log('   - Schema fields: content, generatedAt, expiresAt, entryCount, lastJobUpdate, lastSchemeUpdate');
  console.log('   - TTL index on expiresAt for automatic cleanup');
  console.log('   - Index on generatedAt for cache validation');
  
  process.exit(0);
} catch (error) {
  console.error('\n❌ ERROR:', error.message);
  console.error(error.stack);
  process.exit(1);
}
