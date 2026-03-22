import { app } from './app.js';
import { env, validateEnv } from './config/env.js';
import { connectDb } from './config/db.js';
import { startCron } from './cron/job.cron.js';
import { logger } from './utils/logger.js';

const bootstrap = async () => {
  validateEnv();
  await connectDb();
  startCron();

  app.listen(env.port, () => {
    logger.info(`Backend listening on http://localhost:${env.port}`);
  });
};

bootstrap().catch((error) => {
  logger.error('Failed to start backend', { error: error.message });
  process.exit(1);
});
