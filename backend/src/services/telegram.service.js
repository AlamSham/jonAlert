import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const categoryEmoji = {
  job: '💼',
  result: '📊',
  'admit-card': '🎫',
  admission: '🎓',
  scholarship: '💰',
  'exam-form': '📝'
};

export const buildJobNotificationMessage = (job) => {
  const emoji = categoryEmoji[job.category] || '📢';
  const siteUrl = env.frontendUrl || 'https://sarkaripulse.net';
  const jobUrl = `${siteUrl}/job/${job.slug}`;

  const lines = [
    `${emoji} <b>New ${job.category.toUpperCase()} Notification</b>`,
    `━━━━━━━━━━━━━━━`,
    `📌 <b>${job.title}</b>`
  ];

  if (job.organization) lines.push(`🏛️ <b>Board/Org:</b> ${job.organization}`);
  if (job.state) lines.push(`📍 <b>State:</b> ${job.state}`);
  if (job.vacancyCount > 0) lines.push(`👥 <b>Total Posts:</b> ${job.vacancyCount}`);
  if (job.lastDate) {
    const dateStr = new Date(job.lastDate).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
    lines.push(`📅 <b>Last Date:</b> ${dateStr}`);
  }

  lines.push('');
  lines.push(`🔗 <b>Click Here To Read Full Details & Apply:</b>`);
  lines.push(`👉 <a href="${jobUrl}">${jobUrl}</a>`);
  lines.push('');
  lines.push(`#SarkariPulse #${job.category.replace('-', '')} #GovtJobs #SarkariNaukri`);

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
