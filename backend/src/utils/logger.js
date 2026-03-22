const now = () => new Date().toISOString();
const SENSITIVE_KEYS = ['openai', 'api_key', 'token', 'secret', 'authorization', 'password', 'mongodb_uri'];

const redactValue = (value) => {
  if (typeof value !== 'string') return value;

  let sanitized = value;
  sanitized = sanitized.replace(/(sk-[a-zA-Z0-9-_]{10,})/g, '[REDACTED]');
  sanitized = sanitized.replace(/(bot\d+:[a-zA-Z0-9_-]{10,})/g, '[REDACTED]');
  return sanitized;
};

const sanitizeMeta = (meta) => {
  if (!meta || typeof meta !== 'object') {
    return meta;
  }

  const output = Array.isArray(meta) ? [] : {};
  for (const [key, value] of Object.entries(meta)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some((k) => lowerKey.includes(k))) {
      output[key] = '[REDACTED]';
      continue;
    }

    if (value && typeof value === 'object') {
      output[key] = sanitizeMeta(value);
      continue;
    }

    output[key] = redactValue(value);
  }

  return output;
};

export const logger = {
  info: (msg, meta = {}) => {
    const safeMeta = sanitizeMeta(meta);
    console.log(`[INFO] ${now()} - ${msg}`, Object.keys(safeMeta || {}).length ? safeMeta : '');
  },
  error: (msg, meta = {}) => {
    const safeMeta = sanitizeMeta(meta);
    console.error(`[ERROR] ${now()} - ${msg}`, Object.keys(safeMeta || {}).length ? safeMeta : '');
  },
  warn: (msg, meta = {}) => {
    const safeMeta = sanitizeMeta(meta);
    console.warn(`[WARN] ${now()} - ${msg}`, Object.keys(safeMeta || {}).length ? safeMeta : '');
  }
};
