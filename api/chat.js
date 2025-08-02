const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({ 
        error: 'Gemini API key not configured',
        details: 'Please set GEMINI_API_KEY in your environment variables'
      });
      return;
    }

    const { message, articleContent, conversationHistory = [] } = req.body;

    if (!message || !articleContent) {
      res.status(400).json({ error: 'Message and article content are required' });
      return;
    }

    // Initialize the Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create the system prompt with article context
    const systemPrompt = `You are a helpful AI assistant that answers questions about a specific article. 
    
Here is the article content you should base your answers on:

---
${articleContent}
---

Please answer questions based on this article content. If a question is not related to the article or cannot be answered using the information provided, politely explain that you can only help with questions about this specific article.
If the question is related to the article but does not provide context, you can answer from your knowledge.
Keep your responses concise but informative. Use a friendly and helpful tone.`;

    // Build conversation history for context
    let conversationText = systemPrompt + '\n\n';
    
    // Add conversation history
    conversationHistory.forEach(msg => {
      conversationText += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    });
    
    // Add current message
    conversationText += `User: ${message}\nAssistant: `;

    // Generate response
    const result = await model.generateContent(conversationText);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ 
      response: text,
      success: true
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message
    });
  }
};
