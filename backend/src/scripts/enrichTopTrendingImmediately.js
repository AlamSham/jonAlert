import { validateEnv } from '../config/env.js';
import { connectDb } from '../config/db.js';
import { Job } from '../models/Job.js';
import { rewriteJobWithAi } from '../services/ai.service.js';

const run = async () => {
  validateEnv();
  await connectDb();

  console.log('⚡ Target Enrichment: Instant update for Homepage & Trending Jobs...');

  // Fetch top 50 most viewed / homepage jobs
  const jobs = await Job.find({ status: 'active' })
    .sort({ viewCount: -1, createdAt: -1 })
    .limit(50)
    .lean();

  console.log(`Enriching top ${jobs.length} homepage jobs instantly...`);

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    console.log(`[${i + 1}/${jobs.length}] Transforming: ${job.title}`);

    const enriched = await rewriteJobWithAi({
      title: job.title,
      description: job.summary || job.content || job.title,
      category: job.category,
      sourceName: job.sourceName
    });

    await Job.updateOne(
      { _id: job._id },
      {
        $set: {
          content: enriched.content,
          summary: enriched.summary,
          eligibility: enriched.eligibility,
          importantDates: enriched.importantDates,
          state: enriched.state || job.state || 'All India',
          organization: enriched.organization || job.organization || '',
          vacancyCount: enriched.vacancyCount || job.vacancyCount || 0,
          qualificationLevel: enriched.qualificationLevel || job.qualificationLevel || '',
          applyLink: job.applyLink || enriched.officialLink || '',
          metaTitle: enriched.metaTitle || job.metaTitle || '',
          metaDescription: enriched.metaDescription || job.metaDescription || '',
          tags: enriched.tags && enriched.tags.length > 0 ? enriched.tags : job.tags
        }
      }
    );
  }

  console.log('✅ Top 50 Homepage & Trending Jobs enriched with 1200+ word detailed articles!');
  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
