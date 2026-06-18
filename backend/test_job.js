import mongoose from 'mongoose';
import { env } from './src/config/env.js';
import { Job } from './src/models/Job.js';

async function main() {
  await mongoose.connect(env.mongoUri);
  const job = await Job.findOne({ slug: 'afcat-02-2026-ke-liye-applications-shuru-300-vacancies-hain' }).lean();
  console.log(JSON.stringify(job, null, 2));
  process.exit(0);
}

main().catch(console.error);
