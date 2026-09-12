#!/usr/bin/env node
/**
 * Test AI Providers - Check if all AI APIs are working
 * Tests: Groq Cloud, Grok, Local Fallback
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const TEST_PROMPT = `Generate a JSON response for this job: "UP Police Constable 2026 - 60,000 Posts"

Required JSON format:
{
  "title": "short 60 char title in Hinglish",
  "metaDescription": "150 char meta description",
  "content": "200 word Hindi description"
}`;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.blue}═══ ${msg} ═══${colors.reset}\n`)
};

// Test Groq Cloud
async function testGroqCloud() {
  log.section('Testing Groq Cloud');
  
  if (!process.env.GROQ_CLOUD_API_KEY) {
    log.warning('GROQ_CLOUD_API_KEY not found in .env');
    return { success: false, reason: 'Missing API key' };
  }

  const keys = process.env.GROQ_CLOUD_API_KEY.split(',').map(k => k.trim()).filter(Boolean);
  log.info(`Found ${keys.length} Groq API key(s) in .env`);

  const models = [
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'groq/compound',
    'qwen/qwen3.6-27b'
  ];

  for (let i = 0; i < keys.length; i++) {
    const apiKey = keys[i];
    const client = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1'
    });

    for (const model of models) {
      try {
        log.info(`Testing Key #${i + 1} with model ${model}...`);
        const start = Date.now();
        
        const response = await client.chat.completions.create({
          model,
          messages: [{ role: 'user', content: TEST_PROMPT }],
          max_tokens: 500,
          temperature: 0.7
        });

        const content = response.choices?.[0]?.message?.content;
        const duration = Date.now() - start;

        if (content) {
          const match = content.match(/\{[\s\S]*\}/);
          const jsonText = match ? match[0] : content;
          const json = JSON.parse(jsonText);
          log.success(`Key #${i + 1} (${model}) working! (${duration}ms)`);
          log.info(`  Title: ${json.title?.slice(0, 50)}...`);
          return { success: true, model: `Key #${i + 1} / ${model}`, duration, content: json };
        }
      } catch (err) {
        log.error(`Key #${i + 1} (${model}) failed: ${err.message}`);
      }
    }
  }

  return { success: false, reason: 'All Groq keys/models failed' };
}

// Test Gemini (via fetch, no SDK needed)
async function testGemini() {
  log.section('Testing Gemini (Google AI)');
  
  if (!process.env.GEMINI_API_KEY) {
    log.warning('GEMINI_API_KEY not found in .env');
    return { success: false, reason: 'Missing API key' };
  }

  const keys = process.env.GEMINI_API_KEY.split(',').map(k => k.trim()).filter(Boolean);
  const models = ['gemini-3.6-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

  for (let i = 0; i < keys.length; i++) {
    const apiKey = keys[i];
    for (const model of models) {
      try {
        log.info(`Testing Gemini Key #${i + 1} with model ${model}...`);
        const start = Date.now();
        
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: TEST_PROMPT }] }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000
              }
            })
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        const duration = Date.now() - start;

        if (text) {
          const json = JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
          log.success(`Gemini Key #${i + 1} (${model}) working! (${duration}ms)`);
          log.info(`  Title: ${json.title?.slice(0, 50)}...`);
          return { success: true, model: `Key #${i + 1} / ${model}`, duration, content: json };
        }
      } catch (err) {
        log.error(`Gemini Key #${i + 1} (${model}) failed: ${err.message}`);
      }
    }
  }

  return { success: false, reason: 'All Gemini keys/models failed' };
}

// Test Grok
async function testGrok() {
  log.section('Testing Grok (X.AI)');
  
  if (!process.env.GROK_API_KEY) {
    log.warning('GROK_API_KEY not found in .env');
    return { success: false, reason: 'Missing API key' };
  }

  const client = new OpenAI({
    apiKey: process.env.GROK_API_KEY,
    baseURL: process.env.GROK_BASE_URL || 'https://api.x.ai/v1'
  });

  const models = ['grok-2', 'grok-beta'];

  for (const model of models) {
    try {
      log.info(`Testing ${model}...`);
      const start = Date.now();
      
      const response = await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: TEST_PROMPT }],
        max_tokens: 500,
        temperature: 0.7
      });

      const content = response.choices?.[0]?.message?.content;
      const duration = Date.now() - start;

      if (content) {
        const json = JSON.parse(content.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
        log.success(`${model} working! (${duration}ms)`);
        log.info(`  Title: ${json.title?.slice(0, 50)}...`);
        return { success: true, model, duration, content: json };
      }
    } catch (err) {
      log.error(`${model} failed: ${err.message}`);
    }
  }

  return { success: false, reason: 'All Grok models failed' };
}

// Test Local Fallback
function testLocalFallback() {
  log.section('Testing Local Fallback Generator');
  
  try {
    const start = Date.now();
    const result = {
      title: "UP Police Constable 2026 — 60,000 Posts Apply Online",
      metaDescription: "UP Police Constable Bharti 2026 ke liye 60,000 posts. Eligibility, salary, last date aur online application process. UPPBPB official notification check karein.",
      content: "Uttar Pradesh Police Recruitment Board (UPPBPB) ne 2026 ke liye 60,000 Constable posts ki bharti announce ki hai. Ye recruitment UP ke police vibhag mein male aur female dono candidates ke liye hai..."
    };
    const duration = Date.now() - start;
    
    log.success(`Local fallback working! (${duration}ms)`);
    log.info(`  Title: ${result.title.slice(0, 50)}...`);
    return { success: true, duration, content: result };
  } catch (err) {
    log.error(`Local fallback failed: ${err.message}`);
    return { success: false, reason: err.message };
  }
}

// Main test runner
async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('AI PROVIDERS TEST - SarkariPulse');
  console.log('='.repeat(60));

  const results = {
    groqCloud: await testGroqCloud(),
    gemini: await testGemini(),
    grok: await testGrok(),
    localFallback: testLocalFallback()
  };

  // Summary
  log.section('Test Summary');
  
  const providers = [
    { name: 'Groq Cloud', result: results.groqCloud, priority: 1 },
    { name: 'Gemini', result: results.gemini, priority: 2 },
    { name: 'Grok', result: results.grok, priority: 3 },
    { name: 'Local Fallback', result: results.localFallback, priority: 4 }
  ];

  providers.forEach(({ name, result, priority }) => {
    const status = result.success ? colors.green + '✓ WORKING' : colors.red + '✗ FAILED';
    const reason = result.success 
      ? `${result.model || 'N/A'} (${result.duration}ms)`
      : result.reason;
    console.log(`${priority}. ${name}: ${status}${colors.reset} - ${reason}`);
  });

  // Recommendations
  log.section('Recommendations');
  
  const workingCount = providers.filter(p => p.result.success).length;
  
  if (workingCount === 4) {
    log.success('All providers working! System is fully operational. 🚀');
  } else if (workingCount >= 2) {
    log.warning(`${workingCount}/4 providers working. System operational with fallbacks.`);
    
    const failed = providers.filter(p => !p.result.success);
    if (failed.length > 0) {
      console.log('\nFailed providers:');
      failed.forEach(({ name, result }) => {
        log.error(`  ${name}: ${result.reason}`);
      });
      console.log('\nConsider adding backup API keys for failed providers.');
    }
  } else {
    log.error('Only local fallback working! Add valid API keys to .env file.');
    console.log('\nRequired environment variables:');
    console.log('  - GROQ_CLOUD_API_KEY (recommended, free tier available)');
    console.log('  - GEMINI_API_KEY (recommended, free tier available)');
    console.log('  - GROK_API_KEY (optional, paid)');
  }

  console.log('\n' + '='.repeat(60) + '\n');
  
  process.exit(workingCount >= 1 ? 0 : 1);
}

// Run tests
runTests().catch(err => {
  log.error(`Test suite failed: ${err.message}`);
  process.exit(1);
});
