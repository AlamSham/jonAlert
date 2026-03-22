import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const categoryEmoji = {
  job: '💼',
  result: '📊',
  'admit-card': '🎫'
};

export const buildJobNotificationMessage = (job) => {
  const emoji = categoryEmoji[job.category] || '📢';
  const lines = [
    `${emoji} <b>New ${job.category.toUpperCase()} Update</b>`,
    `━━━━━━━━━━━━━━━`,
    `📌 ${job.title}`
  ];

  if (job.organization) lines.push(`🏛️ Org: ${job.organization}`);
  if (job.state) lines.push(`📍 State: ${job.state}`);
  if (job.vacancyCount > 0) lines.push(`👥 Vacancies: ${job.vacancyCount}`);
  if (job.lastDate) {
    const dateStr = new Date(job.lastDate).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
    lines.push(`📅 Last Date: ${dateStr}`);
  }

  lines.push(`📂 Category: ${job.category}`);
  lines.push(`🔗 Slug: ${job.slug}`);
  if (job.sourceName) lines.push(`📰 Source: ${job.sourceName}`);
  lines.push('');
  lines.push(`#SarkariPulse #${job.category.replace('-', '')} #GovtJobs`);

  return lines.join('\n');
};

export const sendTelegramMessage = async (message) => {
  if (!env.telegramBotToken || !env.telegramChatId) {
    logger.warn('Telegram config missing, skipping notification');
    return;
  }

  const url = `https://api.telegram.org/bot${env.telegramBotToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.telegramChatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Telegram API error: ${response.status} ${body}`);
    }
  } catch (error) {
    logger.error('Telegram notification failed', { error: error.message });
  }
};
