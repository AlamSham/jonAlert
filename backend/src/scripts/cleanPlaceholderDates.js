import { validateEnv } from '../config/env.js';
import { connectDb } from '../config/db.js';
import { Job } from '../models/Job.js';

const run = async () => {
  validateEnv();
  await connectDb();

  console.log('🔍 Cleaning placeholder dates in MongoDB...');

  const placeholderPattern = /official notification check karein|check official notification|refer to official notification|exact dates|as per notification/i;

  const jobsWithPlaceholders = await Job.find({
    importantDates: { $regex: placeholderPattern }
  }).select('_id title importantDates').lean();

  console.log(`Found ${jobsWithPlaceholders.length} jobs with generic placeholder dates in DB.`);

  if (jobsWithPlaceholders.length > 0) {
    const ids = jobsWithPlaceholders.map(j => j._id);
    const updateResult = await Job.updateMany(
      { _id: { $in: ids } },
      { $set: { importantDates: '' } }
    );
    console.log(`✅ Cleared generic placeholder dates for ${updateResult.modifiedCount} jobs in DB!`);
  }

  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
