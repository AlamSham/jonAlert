#!/usr/bin/env node
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const keys = process.env.GROQ_CLOUD_API_KEY.split(',').map(k => k.trim()).filter(Boolean);

for (let i = 0; i < keys.length; i++) {
  console.log(`\nTesting Groq Key #${i + 1} (${keys[i].slice(0, 10)}...)...`);
  const client = new OpenAI({
    apiKey: keys[i],
    baseURL: 'https://api.groq.com/openai/v1'
  });

  try {
    const models = await client.models.list();
    console.log(`Available Models for Key #${i + 1}:`);
    models.data.forEach(model => console.log(`  - ${model.id}`));
  } catch (err) {
    console.error(`Key #${i + 1} Error:`, err.message);
  }
}
