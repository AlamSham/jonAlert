#!/usr/bin/env node
/**
 * Quick AI Test - Test with current working models
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

console.log('\n🧪 Quick AI Provider Test\n' + '='.repeat(60));

// Test 1: Groq with NEW working models
async function testGroq() {
  console.log('\n1️⃣ Testing Groq Cloud...');
  
  if (!process.env.GROQ_CLOUD_API_KEY) {
    console.log('❌ GROQ_CLOUD_API_KEY missing');
    return false;
  }

  const client = new OpenAI({
    apiKey: process.env.GROQ_CLOUD_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1'
  });

  // Try NEW Groq models (as of 2026)
  const workingModels = [
    'llama-3.3-70b-versatile',
    'llama-3.1-70b-versatile', 
    'llama3-70b-8192'
  ];

  for (const model of workingModels) {
    try {
      console.log(`  Testing ${model}...`);
      const response = await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: 'Say "hello" in JSON format: {"message": "..."}' }],
        max_tokens: 50,
        response_format: { type: 'json_object' }
      });

      if (response.choices?.[0]?.message?.content) {
        console.log(`  ✅ ${model} WORKING!`);
        console.log(`     Response: ${response.choices[0].message.content.slice(0, 50)}...`);
        return true;
      }
    } catch (err) {
      console.log(`  ❌ ${model} failed: ${err.message.slice(0, 80)}`);
    }
  }
  
  return false;
}

// Test 2: Gemini with correct API
async function testGemini() {
  console.log('\n2️⃣ Testing Gemini...');
  
  if (!process.env.GEMINI_API_KEY) {
    console.log('❌ GEMINI_API_KEY missing');
    return false;
  }

  // Try with v1 API (not v1beta)
  const models = [
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-1.5-pro-latest'
  ];

  for (const model of models) {
    try {
      console.log(`  Testing ${model}...`);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Say hello in JSON: {"message": "hello"}' }] }]
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log(`  ✅ ${model} WORKING!`);
        console.log(`     Response: ${text?.slice(0, 50)}...`);
        return true;
      } else {
        const error = await response.text();
        console.log(`  ❌ ${model} failed: ${error.slice(0, 100)}`);
      }
    } catch (err) {
      console.log(`  ❌ ${model} error: ${err.message}`);
    }
  }
  
  return false;
}

// Test 3: Grok (if key available)
async function testGrok() {
  console.log('\n3️⃣ Testing Grok (X.AI)...');
  
  const grokKey = process.env.GROK_API_KEY || '';
  
  if (!grokKey || grokKey.length < 20) {
    console.log('❌ GROK_API_KEY missing or invalid');
    return false;
  }

  const client = new OpenAI({
    apiKey: grokKey,
    baseURL: 'https://api.x.ai/v1'
  });

  const models = ['grok-2', 'grok-beta', 'grok-2-latest'];

  for (const model of models) {
    try {
      console.log(`  Testing ${model}...`);
      const response = await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: 'Say hello in JSON: {"message": "hello"}' }],
        max_tokens: 50
      });

      if (response.choices?.[0]?.message?.content) {
        console.log(`  ✅ ${model} WORKING!`);
        console.log(`     Response: ${response.choices[0].message.content.slice(0, 50)}...`);
        return true;
      }
    } catch (err) {
      console.log(`  ❌ ${model} failed: ${err.message.slice(0, 80)}`);
    }
  }
  
  return false;
}

// Run tests
(async () => {
  const results = {
    groq: await testGroq(),
    gemini: await testGemini(),
    grok: await testGrok()
  };

  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY:');
  console.log('  Groq Cloud:', results.groq ? '✅ WORKING' : '❌ FAILED');
  console.log('  Gemini:', results.gemini ? '✅ WORKING' : '❌ FAILED');
  console.log('  Grok:', results.grok ? '✅ WORKING' : '❌ FAILED');
  
  const working = Object.values(results).filter(Boolean).length;
  console.log(`\n  ${working}/3 providers working`);
  
  if (working === 0) {
    console.log('\n⚠️  WARNING: All AI providers failed! Using local fallback only.');
  } else if (working === 3) {
    console.log('\n🎉 SUCCESS: All AI providers working!');
  } else {
    console.log('\n✅ PARTIAL: Some providers working. System operational.');
  }
  console.log('='.repeat(60) + '\n');
})();
