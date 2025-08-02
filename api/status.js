module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const status = {
    server: 'running',
    mongodb_uri: process.env.mongo_uri ? 'configured' : 'missing',
    gemini_api_key: process.env.GEMINI_API_KEY ? 'configured' : 'missing',
    node_env: process.env.NODE_ENV || 'development'
  };

  res.status(200).json(status);
};
