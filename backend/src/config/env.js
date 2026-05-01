import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || '',
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  openAiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  aiEnabled: (process.env.AI_ENABLED || 'true').toLowerCase() === 'true',
  aiQuotaCooldownMinutes: Number(process.env.AI_QUOTA_COOLDOWN_MINUTES || 60),
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  geminiQuotaCooldownMinutes: Number(process.env.GEMINI_QUOTA_COOLDOWN_MINUTES || 60),
  grokApiKey: process.env.GROK_API_KEY || '',
  grokModel: process.env.GROK_MODEL || 'grok-2-latest',
  grokBaseUrl: process.env.GROK_BASE_URL || 'https://api.x.ai/v1',
  grokQuotaCooldownMinutes: Number(process.env.GROK_QUOTA_COOLDOWN_MINUTES || 60),
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
  metaGraphVersion: process.env.META_GRAPH_VERSION || 'v24.0',
  metaPageId: process.env.META_PAGE_ID || process.env.FACEBOOK_PAGE_ID || '',
  metaPageAccessToken: process.env.META_PAGE_ACCESS_TOKEN || process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '',
  metaUserAccessToken: process.env.META_USER_ACCESS_TOKEN || process.env.FACEBOOK_USER_ACCESS_TOKEN || '',
  metaAppId: process.env.META_APP_ID || '',
  metaAppSecret: process.env.META_APP_SECRET || '',
  facebookAutopostEnabled: (process.env.FACEBOOK_AUTOPOST_ENABLED || 'true').toLowerCase() === 'true',
  facebookPostDelayMs: Number(process.env.FACEBOOK_POST_DELAY_MS || 10000),
  facebookPostRetryDelayMs: Number(process.env.FACEBOOK_POST_RETRY_DELAY_MS || 30000),
  facebookPostMaxRetries: Number(process.env.FACEBOOK_POST_MAX_RETRIES || 3),
  facebookRequestTimeoutMs: Number(process.env.FACEBOOK_REQUEST_TIMEOUT_MS || 15000),
  facebookQueueWaitTimeoutMs: Number(process.env.FACEBOOK_QUEUE_WAIT_TIMEOUT_MS || 180000),
  facebookRetryDuplicateWindowHours: Number(process.env.FACEBOOK_RETRY_DUPLICATE_WINDOW_HOURS || 24),
  cronEnabled: (process.env.CRON_ENABLED || 'true').toLowerCase() === 'true',
  cronSchedule: process.env.CRON_SCHEDULE || '*/30 * * * *',
  cronMaxNewPerRun: Number(process.env.CRON_MAX_NEW_PER_RUN || 10),
  cronAiDelayMs: Number(process.env.CRON_AI_DELAY_MS || 2000),
  dbTtlDays: Number(process.env.DB_TTL_DAYS || 90),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  cronSecret: process.env.CRON_SECRET || '',
  jobSourcesJson: process.env.JOB_SOURCES_JSON || '',
  jobSourcesFile: process.env.JOB_SOURCES_FILE || '',
  scraperUserAgent: process.env.SCRAPER_USER_AGENT || 'JobAutomationBot/1.0 (+https://example.com/bot)'
};

export const validateEnv = () => {
  if (!env.mongoUri) {
    throw new Error('MONGODB_URI is required');
  }
  if (!env.frontendUrl) {
    throw new Error('FRONTEND_URL is required');
  }
};
