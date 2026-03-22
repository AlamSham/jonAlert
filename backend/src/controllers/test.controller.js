import { env } from '../config/env.js';
import { rewriteJobWithAi } from '../services/ai.service.js';
import { sendTelegramMessage } from '../services/telegram.service.js';
import { logger } from '../utils/logger.js';

export const pingTest = async (req, res) => {
  logger.info('Test ping started', { ip: req.ip, path: req.originalUrl });
  logger.info('Test ping completed', { ip: req.ip, path: req.originalUrl });

  res.json({
    ok: true,
    message: 'Test ping successful',
    timestamp: new Date().toISOString()
  });
};

export const configStatusTest = async (req, res) => {
  logger.info('Config test started', { ip: req.ip, path: req.originalUrl });

  const status = {
    openAiConfigured: Boolean(env.openAiApiKey),
    telegramConfigured: Boolean(env.telegramBotToken && env.telegramChatId),
    mongoConfigured: Boolean(env.mongoUri),
    cronSecretConfigured: Boolean(env.cronSecret)
  };

  logger.info('Config test completed', { ip: req.ip, status });

  return res.json({
    ok: true,
    message: 'Configuration status checked',
    status
  });
};

export const requiredKeysTest = async (req, res) => {
  logger.info('Required keys test started', { ip: req.ip, path: req.originalUrl });

  const scope = req.validated?.scope || 'all';
  const missing = [];

  if (scope === 'all' || scope === 'ai') {
    if (!env.openAiApiKey) missing.push('OPENAI_API_KEY');
  }

  if (scope === 'all' || scope === 'telegram') {
    if (!env.telegramBotToken) missing.push('TELEGRAM_BOT_TOKEN');
    if (!env.telegramChatId) missing.push('TELEGRAM_CHAT_ID');
  }

  if (missing.length > 0) {
    logger.warn('Required keys test found missing keys', { ip: req.ip, scope, missing });
    return res.status(503).json({
      message: 'Required service keys are missing',
      missing
    });
  }

  logger.info('Required keys test completed', { ip: req.ip, scope, missingCount: 0 });
  return res.json({
    ok: true,
    message: 'All required keys are configured for selected scope',
    scope
  });
};

export const telegramTest = async (req, res) => {
  logger.info('Telegram test started', { ip: req.ip, path: req.originalUrl });

  const customMessage = req.validated?.message;
  const message = customMessage || `Test message from Job Automation at ${new Date().toISOString()}`;

  await sendTelegramMessage(message);

  logger.info('Telegram test completed', {
    ip: req.ip,
    telegramConfigured: Boolean(env.telegramBotToken && env.telegramChatId)
  });

  return res.json({
    ok: true,
    message: 'Telegram test executed. Check logs/Telegram delivery for confirmation.'
  });
};

export const aiTest = async (req, res) => {
  logger.info('AI test started', { ip: req.ip, path: req.originalUrl });

  const payload = {
    sourceId: 'ai-test-source',
    title: req.validated?.title || 'Bihar Police Constable Recruitment 2026',
    description:
      req.validated?.description ||
      'Bihar Police ne constable recruitment notification release kiya hai. Online form dates, eligibility aur exam pattern official notice me diya gaya hai.',
    category: req.validated?.category || 'job'
  };

  const aiOutput = await rewriteJobWithAi(payload);

  logger.info('AI test completed', {
    ip: req.ip,
    openAiConfigured: Boolean(env.openAiApiKey)
  });

  return res.json({
    ok: true,
    message: 'AI test executed',
    openAiConfigured: Boolean(env.openAiApiKey),
    data: aiOutput
  });
};
