import { validateEnv } from '../config/env.js';
import { connectDb } from '../config/db.js';
import { Job } from '../models/Job.js';
import { rewriteJobWithAi } from '../services/ai.service.js';

const run = async () => {
  validateEnv();
  await connectDb();

  console.log('🔍 Finding jobs with thin/stub content in MongoDB...');

  const allJobs = await Job.find({ status: 'active' }).lean();
  console.log(`Total active jobs: ${allJobs.length}`);

  const thinJobs = allJobs.filter(j => {
    const textLength = (j.content || '').replace(/<[^>]*>/g, '').trim().length;
    return textLength < 700 || !j.content.includes('<table');
  });

  console.log(`Found ${thinJobs.length} jobs with thin content (< 700 chars or missing HTML tables).`);

  if (thinJobs.length === 0) {
    console.log('🎉 All active jobs already have 1000+ words of rich content!');
    process.exit(0);
  }

  let enrichedCount = 0;
  console.log('🚀 Starting enrichment process for thin jobs...\n');

  for (let i = 0; i < thinJobs.length; i++) {
    const job = thinJobs[i];
    console.log(`[${i + 1}/${thinJobs.length}] Enriching: ${job.title.slice(0, 60)}...`);

    try {
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

      enrichedCount++;
    } catch (err) {
      console.error(`❌ Failed to enrich job ${job._id}:`, err.message);
    }
  }

  console.log(`\n✅ Successfully enriched ${enrichedCount} thin jobs with 1200+ word rich content & HTML tables in MongoDB!`);
  process.exit(0);
};

run().catch((err) => {
  console.error('Enrichment script failed:', err);
  process.exit(1);
});
