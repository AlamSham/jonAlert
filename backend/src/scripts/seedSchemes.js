import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Scheme } from '../models/Scheme.js';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function seedSchemes() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(env.mongoUri);
    console.log('Connected to MongoDB successfully');

    // Read seed data
    const seedDataPath = join(__dirname, '../data/schemes.seed.json');
    const seedData = JSON.parse(readFileSync(seedDataPath, 'utf-8'));
    console.log(`Found ${seedData.length} schemes in seed data`);

    let inserted = 0;
    let skipped = 0;
    let errors = 0;

    // Insert schemes one by one
    for (const schemeData of seedData) {
      try {
        // Check if scheme already exists
        const existing = await Scheme.findOne({ slug: schemeData.slug });
        
        if (existing) {
          console.log(`⏭️  Skipped: ${schemeData.title} (already exists)`);
          skipped++;
          continue;
        }

        // Insert new scheme
        await Scheme.create(schemeData);
        console.log(`✅ Inserted: ${schemeData.title}`);
        inserted++;
      } catch (error) {
        console.error(`❌ Error inserting ${schemeData.title}:`, error.message);
        errors++;
      }
    }

    // Summary
    console.log('\n📊 Seeding Summary:');
    console.log(`   ✅ Inserted: ${inserted}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📝 Total: ${seedData.length}`);

    // Close connection
    await mongoose.connection.close();
    console.log('\n✨ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding
seedSchemes();
