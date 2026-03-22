import OpenAI from 'openai';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const client = env.openAiApiKey ? new OpenAI({ apiKey: env.openAiApiKey }) : null;
const grokClient = env.grokApiKey
  ? new OpenAI({
      apiKey: env.grokApiKey,
      baseURL: env.grokBaseUrl
    })
  : null;
let openAiDisabledUntil = 0;
let geminiDisabledUntil = 0;
let grokDisabledUntil = 0;
const CONFIG_ERROR_COOLDOWN_MS = 12 * 60 * 60 * 1000;

const categoryLabels = {
  job: 'Sarkari Naukri',
  result: 'Sarkari Result',
  'admit-card': 'Admit Card'
};

const inferStateFromText = (text = '') => {
  const lower = text.toLowerCase();
  const states = [
    'andhra pradesh', 'arunachal pradesh', 'assam', 'bihar', 'chhattisgarh',
    'goa', 'gujarat', 'haryana', 'himachal pradesh', 'jharkhand', 'karnataka',
    'kerala', 'madhya pradesh', 'maharashtra', 'manipur', 'meghalaya',
    'mizoram', 'nagaland', 'odisha', 'punjab', 'rajasthan', 'sikkim',
    'tamil nadu', 'telangana', 'tripura', 'uttar pradesh', 'uttarakhand',
    'west bengal', 'delhi', 'jammu', 'kashmir', 'ladakh', 'chandigarh',
    'puducherry', 'lakshadweep', 'andaman'
  ];
  for (const state of states) {
    if (lower.includes(state)) return state.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
  return 'All India';
};

const inferTagsFromText = (title = '', category = '') => {
  const tags = [category];
  const keywords = ['upsc', 'ssc', 'railway', 'rrb', 'ibps', 'sbi', 'rbi', 'police',
    'army', 'navy', 'air force', 'teacher', 'nurse', 'engineer', 'clerk',
    'constable', 'psc', 'neet', 'jee', 'ntpc', 'group d', 'group c'];
  const lower = title.toLowerCase();
  for (const kw of keywords) {
    if (lower.includes(kw)) tags.push(kw);
  }
  return [...new Set(tags)];
};

const fallbackTransform = (job) => {
  const cat = categoryLabels[job.category] || 'Sarkari Update';
  const title = job.title.replace(/\s*[-–|]\s*(Latest Update|Sarkari.*)$/i, '').trim();
  const descClean = (job.description || '').slice(0, 300).trim();

  const contentByCategory = {
    job: `${title} ke liye nayi bharti notification jaari ho chuki hai. ` +
      `${descClean}\n\n` +
      `Is ${cat} ke baare mein poori jaankari jaise ki eligibility, age limit, aur last date neeche di gayi hai. ` +
      `Interested candidates jald se jald official website visit karke apply karein. ` +
      `Application process online hai aur form bharne se pehle notification dhyan se padhein.`,
    result: `${title} ka result declare ho chuka hai. ` +
      `${descClean}\n\n` +
      `Candidates apna result official website par check kar sakte hain. ` +
      `Apna roll number aur date of birth dalkar scorecard download karein. ` +
      `Merit list aur cut-off marks bhi jaldi jaari honge.`,
    'admit-card': `${title} ka admit card download ke liye available hai. ` +
      `${descClean}\n\n` +
      `Candidates apna admit card official website se download karein. ` +
      `Exam mein jaane se pehle admit card print karke saath rakhein. ` +
      `Admit card par exam center, timing aur zaroori instructions di hain.`
  };

  const combinedText = `${title} ${descClean}`;

  return {
    rewrittenTitle: `${title} — ${cat} 2026 Notification`,
    content: contentByCategory[job.category] || contentByCategory.job,
    summary: `${cat}: ${title}. ${descClean.slice(0, 100)}...`,
    eligibility: `Is ${cat.toLowerCase()} ke liye age limit, educational qualification aur category reservation details official notification mein dekh sakte hain.`,
    importantDates: `Application/exam ki important dates ke liye official notification check karein — last date miss na karein.`,
    state: inferStateFromText(combinedText),
    organization: '',
    vacancyCount: 0,
    lastDate: '',
    qualificationLevel: '',
    metaTitle: `${title} — ${cat} 2026 | SarkariPulse`.slice(0, 60),
    metaDescription: `${cat}: ${title}. ${descClean.slice(0, 120)}`.slice(0, 155),
    tags: inferTagsFromText(title, job.category)
  };
};

const buildPrompt = (job) => `
You are an expert SEO content writer for a popular Indian government jobs website (SarkariPulse).
Your audience searches in Hindi + English mix. Write in natural, conversational Hinglish.

TASK: Rewrite this job notification as a unique, engaging Hinglish article.

INPUT:
Title: ${job.title}
Description: ${job.description}
Category: ${job.category}

OUTPUT: Return ONLY valid JSON with this exact structure:
{
  "rewrittenTitle": "Catchy Hinglish title with primary keyword (max 70 chars, NO source name like Adda247/Jagran/Times)",
  "content": "Unique SEO-friendly Hinglish article (120-180 words). Include: kya hai yeh bharti, kitni vacancies, kaun apply kar sakta hai, kaise apply karein, important dates. Use natural Hindi-English mix.",
  "summary": "2-3 line crisp summary in Hinglish covering key points",
  "eligibility": "Age limit, education aur category requirements in bullet format using commas",
  "importantDates": "Specific dates mentioned or 'Official notification check karein for exact dates'",
  "state": "Indian state name if mentioned (e.g. Bihar, Uttar Pradesh, Maharashtra). Use 'All India' if central/national/multi-state.",
  "organization": "Organization/department name (e.g. UPSC, SSC, Railway, Bihar Police). Extract from title/description.",
  "vacancyCount": 0,
  "lastDate": "Last date to apply in YYYY-MM-DD format if mentioned, otherwise empty string",
  "qualificationLevel": "One of: 10th, 12th, graduate, post-graduate, diploma, iti, any. Pick the minimum required.",
  "metaTitle": "SEO meta title under 60 chars with primary keyword in Hinglish",
  "metaDescription": "SEO meta description under 155 chars summarizing the notification in Hinglish",
  "tags": ["tag1", "tag2", "tag3"]
}

STRICT RULES:
- NEVER copy the title as-is. Rewrite it with relevant Hindi keywords.
- NEVER add source names (Adda247, Jagran Josh, Times of India etc) in title.
- Content must be UNIQUE, not a template. Mention specific details from the description.
- Use Hinglish naturally: "apply karein", "bharti", "vacancies", "notification jaari".
- vacancyCount must be a number (0 if unknown). lastDate must be YYYY-MM-DD or empty string.
- tags should include category, organization, state if applicable. Max 5 tags.
- No markdown, no extra keys, no comments.
`.trim();

const parseDateSafe = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const normalizeAiJson = (text) => {
  let parsedText = text;

  try {
    JSON.parse(parsedText);
  } catch (_error) {
    const start = parsedText.indexOf('{');
    const end = parsedText.lastIndexOf('}');
    if (start >= 0 && end > start) {
      parsedText = parsedText.slice(start, end + 1);
    }
  }

  const parsed = JSON.parse(parsedText);
  return {
    rewrittenTitle: parsed.rewrittenTitle,
    content: parsed.content,
    summary: parsed.summary,
    eligibility: parsed.eligibility,
    importantDates: parsed.importantDates,
    state: parsed.state || 'All India',
    organization: parsed.organization || '',
    vacancyCount: Number(parsed.vacancyCount) || 0,
    lastDate: parseDateSafe(parsed.lastDate),
    qualificationLevel: parsed.qualificationLevel || '',
    metaTitle: (parsed.metaTitle || '').slice(0, 60),
    metaDescription: (parsed.metaDescription || '').slice(0, 155),
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5).map(String) : []
  };
};

const isQuotaError = (error) => {
  const statusCode = Number(error?.status || error?.code || 0);
  return statusCode === 429 || String(error?.message || '').includes('429');
};

const getStatusCode = (error) => Number(error?.status || error?.code || 0);

const isProviderConfigError = (error) => {
  const statusCode = getStatusCode(error);
  if (statusCode !== 400 && statusCode !== 404) return false;

  const message = String(error?.message || '').toLowerCase();
  return (
    message.includes('model not found') ||
    message.includes('is not found') ||
    message.includes('not supported') ||
    message.includes('unknown model')
  );
};

const isAuthError = (error) => {
  const statusCode = getStatusCode(error);
  return statusCode === 401 || statusCode === 403;
};

const rewriteWithOpenAi = async (prompt) => {
  if (!client) {
    throw new Error('OPENAI_API_KEY missing');
  }

  const response = await client.chat.completions.create({
    model: env.openAiModel,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500,
    temperature: 0.7,
    response_format: { type: 'json_object' }
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('No OpenAI content returned');
  }

  return normalizeAiJson(content);
};

const rewriteWithGemini = async (prompt) => {
  if (!env.geminiApiKey) {
    throw new Error('GEMINI_API_KEY missing');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.geminiModel}:generateContent?key=${env.geminiApiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
        responseMimeType: 'application/json'
      },
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    const body = await response.text();
    const err = new Error(`Gemini error: ${response.status} ${body}`);
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) {
    throw new Error('No Gemini content returned');
  }

  return normalizeAiJson(content);
};

const rewriteWithGrok = async (prompt) => {
  if (!grokClient) {
    throw new Error('GROK_API_KEY missing');
  }

  const response = await grokClient.chat.completions.create({
    model: env.grokModel,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500,
    temperature: 0.7
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('No Grok content returned');
  }

  return normalizeAiJson(content);
};

const formatCooldownRemaining = (disabledUntil) => {
  const remainingMs = disabledUntil - Date.now();
  if (remainingMs <= 0) return 'expired';
  const mins = Math.ceil(remainingMs / 60000);
  return `${mins} min remaining`;
};

export const rewriteJobWithAi = async (job) => {
  if (!env.aiEnabled) {
    logger.warn('AI disabled via AI_ENABLED=false, using fallback text generation');
    return fallbackTransform(job);
  }

  const prompt = buildPrompt(job);

  // Try OpenAI
  if (Date.now() >= openAiDisabledUntil) {
    try {
      const result = await rewriteWithOpenAi(prompt);
      logger.info('AI rewrite successful via OpenAI', { title: job.title.slice(0, 50) });
      return result;
    } catch (error) {
      if (isQuotaError(error)) {
        const cooldownMs = Math.max(1, env.aiQuotaCooldownMinutes) * 60 * 1000;
        openAiDisabledUntil = Date.now() + cooldownMs;
        logger.warn('OpenAI quota/rate limit reached, switching to Gemini/Grok fallback', {
          cooldownMinutes: env.aiQuotaCooldownMinutes
        });
      } else if (isAuthError(error)) {
        openAiDisabledUntil = Date.now() + CONFIG_ERROR_COOLDOWN_MS;
        logger.error('OpenAI auth failed (invalid/expired API key), disabling for 12h', {
          status: getStatusCode(error)
        });
      } else {
        logger.error('OpenAI generation failed, trying Gemini/Grok fallback', { error: error.message });
      }
    }
  } else {
    logger.info('OpenAI skipped (cooldown active)', { cooldown: formatCooldownRemaining(openAiDisabledUntil) });
  }

  // Try Gemini
  if (Date.now() >= geminiDisabledUntil) {
    try {
      const result = await rewriteWithGemini(prompt);
      logger.info('AI rewrite successful via Gemini', { title: job.title.slice(0, 50) });
      return result;
    } catch (error) {
      if (isQuotaError(error)) {
        const cooldownMs = Math.max(1, env.geminiQuotaCooldownMinutes) * 60 * 1000;
        geminiDisabledUntil = Date.now() + cooldownMs;
        logger.warn('Gemini quota/rate limit reached, trying Grok fallback', {
          cooldownMinutes: env.geminiQuotaCooldownMinutes
        });
      } else if (isProviderConfigError(error)) {
        geminiDisabledUntil = Date.now() + CONFIG_ERROR_COOLDOWN_MS;
        logger.warn('Gemini provider config/model invalid, temporarily disabling Gemini', {
          model: env.geminiModel,
          cooldownHours: 12
        });
      } else if (isAuthError(error)) {
        geminiDisabledUntil = Date.now() + CONFIG_ERROR_COOLDOWN_MS;
        logger.error('Gemini auth failed (invalid API key), disabling for 12h');
      } else {
        logger.error('Gemini generation failed, trying Grok fallback', { error: error.message });
      }
    }
  } else {
    logger.info('Gemini skipped (cooldown active)', { cooldown: formatCooldownRemaining(geminiDisabledUntil) });
  }

  // Try Grok
  if (Date.now() >= grokDisabledUntil) {
    try {
      const result = await rewriteWithGrok(prompt);
      logger.info('AI rewrite successful via Grok', { title: job.title.slice(0, 50) });
      return result;
    } catch (error) {
      if (isQuotaError(error)) {
        const cooldownMs = Math.max(1, env.grokQuotaCooldownMinutes) * 60 * 1000;
        grokDisabledUntil = Date.now() + cooldownMs;
        logger.warn('Grok quota/rate limit reached, using local fallback', {
          cooldownMinutes: env.grokQuotaCooldownMinutes
        });
      } else if (isProviderConfigError(error)) {
        grokDisabledUntil = Date.now() + CONFIG_ERROR_COOLDOWN_MS;
        logger.warn('Grok provider config/model invalid, temporarily disabling Grok', {
          model: env.grokModel,
          cooldownHours: 12
        });
      } else if (isAuthError(error)) {
        grokDisabledUntil = Date.now() + CONFIG_ERROR_COOLDOWN_MS;
        logger.error('Grok auth failed (invalid API key), disabling for 12h');
      } else {
        logger.error('Grok generation failed, using local fallback', { error: error.message });
      }
    }
  } else {
    logger.info('Grok skipped (cooldown active)', { cooldown: formatCooldownRemaining(grokDisabledUntil) });
  }

  // All providers failed — use improved fallback
  if (!client && !env.geminiApiKey && !grokClient) {
    logger.warn('No AI provider keys configured, using local fallback');
  } else {
    logger.warn('All AI providers exhausted/cooldown, using local fallback', {
      openAiCooldown: formatCooldownRemaining(openAiDisabledUntil),
      geminiCooldown: formatCooldownRemaining(geminiDisabledUntil),
      grokCooldown: formatCooldownRemaining(grokDisabledUntil)
    });
  }

  return fallbackTransform(job);
};
