// Test the complete rephrase flow as it would happen from the Chrome extension

const API_URL = 'https://www.captur.academy';

async function testRephraseFlow() {
  console.log('Testing rephrase flow...\n');
  
  const testContent = 'I want to obtain information regarding the new features that were implemented.';
  
  console.log('1. Simulating content script sending message to background script');
  console.log('   Content:', testContent);
  
  console.log('\n2. Background script making API request to:', `${API_URL}/api/rephrase`);
  
  try {
    const response = await fetch(`${API_URL}/api/rephrase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: testContent }),
    });
    
    console.log('\n3. API Response:');
    console.log('   Status:', response.status);
    console.log('   Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('   Error:', errorText);
      return;
    }
    
    const contentType = response.headers.get('content-type') || '';
    console.log('   Content-Type:', contentType);
    
    if (contentType.includes('application/json')) {
      const data = await response.json();
      console.log('\n4. Parsed JSON Response:');
      console.log('   ', JSON.stringify(data, null, 2));
      
      console.log('\n5. Content script would receive:');
      console.log('   Success:', true);
      console.log('   Data:', data);
      
      console.log('\n6. Testing response format compatibility:');
      console.log('   Has alternatives?', data.alternatives !== undefined);
      console.log('   Has rephrased?', data.rephrased !== undefined);
      console.log('   Alternatives array:', data.alternatives);
      console.log('   Would show options:', data.alternatives?.length > 0 || data.rephrased ? 'YES' : 'NO');
      
    } else {
      const text = await response.text();
      console.error('   Non-JSON response:', text);
    }
    
  } catch (error) {
    console.error('\n❌ Network or other error:', error.message);
  }
}

testRephraseFlow();