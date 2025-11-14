// Test script for Vercel Functions
// Run with: node test-api.js

const API_BASE = 'http://localhost:3000/api';

async function testRephrase() {
  console.log('\n🧪 Testing /api/rephrase...');
  
  try {
    const response = await fetch(`${API_BASE}/rephrase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: 'I want to obtain information regarding the new features.'
      }),
    });

    const data = await response.json();
    console.log('✅ Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function testPhraseBank() {
  console.log('\n🧪 Testing /api/phrase-bank...');
  
  try {
    const response = await fetch(`${API_BASE}/phrase-bank`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        original: 'I want to obtain information regarding the new features.',
        rephrased: 'I want to get info about the new features.'
      }),
    });

    const data = await response.json();
    console.log('✅ Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run tests
console.log('Starting API tests...');
console.log('Make sure Vercel dev server is running: vercel dev');

testRephrase()
  .then(() => testPhraseBank())
  .then(() => console.log('\n✨ Tests completed!'));