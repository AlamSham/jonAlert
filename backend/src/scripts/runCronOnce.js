import { validateEnv } from '../config/env.js';
import { connectDb } from '../config/db.js';
import { runJobIngestion } from '../cron/job.cron.js';

const run = async () => {
  validateEnv();
  await connectDb();
  const result = await runJobIngestion();
  console.log('Cron run result:', result);
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
