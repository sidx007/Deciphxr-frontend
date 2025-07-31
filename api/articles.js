const { MongoClient } = require('mongodb');

let db;
const mongoUri = process.env.MONGO_URI;
const dbName = 'bot_database';
const collectionName = 'notes';

// MongoDB connection
async function connectToDatabase() {
  if (db) return db;
  
  try {
    const client = await MongoClient.connect(mongoUri);
    db = client.db(dbName);
    return db;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

// Helper function to calculate read time
function calculateReadTime(text) {
  if (!text || text.trim().length === 0) {
    return '1 min read';
  }
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).filter(word => word.length > 0).length;
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
  return `${minutes} min read`;
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const database = await connectToDatabase();
    const collection = database.collection(collectionName);
    
    // Fetch articles sorted by most recently added
    const articles = await collection.find({}).sort({ _id: -1 }).toArray();
    
    // Transform MongoDB documents to frontend format
    const transformedArticles = articles.map((article, index) => {
      // Clean the title - remove markdown headers
      const cleanTitle = (article.Topic || 'Untitled').replace(/^#+\s*/, '').trim();
      
      // Handle Notes field - it's a Python-formatted list string
      let content = '';
      if (article.Notes) {
        try {
          let notesData = article.Notes;
          
          if (typeof notesData === 'string') {
            if (notesData.startsWith('[') && notesData.endsWith(']')) {
              notesData = notesData.slice(1, -1);
              
              const lines = [];
              let current = '';
              let inQuotes = false;
              let quoteChar = '';
              
              for (let i = 0; i < notesData.length; i++) {
                const char = notesData[i];
                
                if (!inQuotes && (char === '"' || char === "'")) {
                  inQuotes = true;
                  quoteChar = char;
                  continue;
                } else if (inQuotes && char === quoteChar) {
                  if (i > 0 && notesData[i-1] === '\\') {
                    current += char;
                    continue;
                  }
                  inQuotes = false;
                  quoteChar = '';
                  continue;
                } else if (!inQuotes && char === ',') {
                  lines.push(current.trim());
                  current = '';
                  continue;
                } else {
                  current += char;
                }
              }
              
              if (current.trim()) {
                lines.push(current.trim());
              }
              
              content = lines.filter(line => line && line.trim()).join('\n');
            } else {
              content = notesData;
            }
          } else if (Array.isArray(notesData)) {
            content = notesData.filter(line => line && line.trim()).join('\n');
          }
          
        } catch (e) {
          console.error('Error parsing Notes field:', e);
          content = article.Notes.toString();
        }
      } else if (article.notes) {
        content = article.notes;
      }
      
      // Create excerpt from content
      const plainTextContent = content.replace(/#+\s/g, '').replace(/\*\*/g, '').replace(/\*/g, '').replace(/\n+/g, ' ').trim();
      const excerpt = plainTextContent.length > 150 
        ? plainTextContent.substring(0, 150) + '...'
        : plainTextContent || 'No content available...';
      
      // Use Subject field for category and tags - clean and standardize
      const rawSubject = article.Subject || article.subject || 'General';
      
      let cleanedSubject = rawSubject
        .replace(/^#+\s*/, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/^(subject|subject name|subject:|subject name:)\s*/i, '')
        .replace(/^:\s*/, '')
        .trim();
      
      const standardSubjects = {
        'cybersecurity': 'Cybersecurity',
        'cyber security': 'Cybersecurity',
        'cloud computing': 'Cloud Computing',
        'computer architecture': 'Computer Architecture',
        'machine learning': 'Machine Learning',
        'image processing': 'Image Processing',
        'computer networking': 'Computer Networking',
        'computer networks': 'Computer Networking',
        'networking': 'Computer Networking',
        'software engineering': 'Software Engineering'
      };
      
      const lowerCleaned = cleanedSubject.toLowerCase();
      const subject = standardSubjects[lowerCleaned] || cleanedSubject || 'General';
      
      return {
        id: article._id.toString(),
        title: cleanTitle,
        excerpt: excerpt,
        content: content,
        category: subject,
        date: article._id.getTimestamp().toISOString().split('T')[0],
        readTime: calculateReadTime(content),
        tags: [subject]
      };
    });
    
    res.status(200).json(transformedArticles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
};
