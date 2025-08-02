const fetch = require('node-fetch');

async function testChatAPI() {
  try {
    console.log('Testing chat API...');
    
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'What is this article about?',
        articleContent: 'This is a test article about computer networks. It covers OSI model, data flow, and network types.',
        conversationHistory: []
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('Success!');
      console.log('Response:', data.response);
    } else {
      console.log('Error:', data.error);
      console.log('Details:', data.details);
    }
  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

testChatAPI();
