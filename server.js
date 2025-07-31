const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// API routes are handled by Vercel serverless functions in production
// For local development, we can proxy to the API functions
if (process.env.NODE_ENV !== 'production') {
  // Import API functions for local development
  const articlesHandler = require('./api/articles');
  const subjectsHandler = require('./api/subjects');
  
  app.get('/api/articles', articlesHandler);
  app.get('/api/subjects', subjectsHandler);
}

// Serve the main HTML file for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server (only for local development)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
