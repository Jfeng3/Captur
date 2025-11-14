// Test script for Production Vercel Functions
// Update the PROD_URL with your actual Vercel app URL

// Production URL (with www subdomain)
const PROD_URL = 'https://www.captur.academy';

async function testRephrase() {
  console.log('\n🧪 Testing Production /api/rephrase...');
  console.log(`URL: ${PROD_URL}/api/rephrase`);
  
  try {
    const response = await fetch(`${PROD_URL}/api/rephrase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: 'I want to obtain information regarding the new features that were implemented.'
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ HTTP Error:', response.status, error);
      return;
    }

    const data = await response.json();
    console.log('✅ Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testPhraseBank() {
  console.log('\n🧪 Testing Production /api/phrase-bank...');
  console.log(`URL: ${PROD_URL}/api/phrase-bank`);
  
  try {
    const response = await fetch(`${PROD_URL}/api/phrase-bank`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        original: 'I want to obtain information regarding the new features.',
        rephrased: 'I want to get info about the new features.'
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ HTTP Error:', response.status, error);
      return;
    }

    const data = await response.json();
    console.log('✅ Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Check if URL is set
if (PROD_URL.includes('your-app-name')) {
  console.error('❌ Please update PROD_URL with your actual Vercel app URL');
  console.log('\nTo find your URL:');
  console.log('1. Go to https://vercel.com/dashboard');
  console.log('2. Click on your project');
  console.log('3. Copy the production URL (e.g., https://captur-abc123.vercel.app)');
  process.exit(1);
}

// Run tests
console.log('🚀 Starting Production API tests...');
console.log(`Testing against: ${PROD_URL}`);

testRephrase()
  .then(() => testPhraseBank())
  .then(() => console.log('\n✨ Tests completed!'));