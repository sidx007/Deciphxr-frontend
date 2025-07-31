const { MongoClient } = require('mongodb');

let db;
const mongoUri = process.env.mongo_uri;
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
    
    // Get distinct subjects
    const subjectsUpper = await collection.distinct('Subject');
    const subjectsLower = await collection.distinct('subject');
    
    const allRawSubjects = [...subjectsUpper, ...subjectsLower].filter(subject => subject);
    
    // Standardize subjects mapping
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
    
    // Clean and standardize each subject
    const cleanedSubjects = allRawSubjects.map(rawSubject => {
      let cleaned = rawSubject
        .replace(/^#+\s*/, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/^(subject|subject name|subject:|subject name:)\s*/i, '')
        .replace(/^:\s*/, '')
        .trim();
      
      const lowerCleaned = cleaned.toLowerCase();
      return standardSubjects[lowerCleaned] || cleaned || 'General';
    });
    
    // Get unique standardized subjects
    const uniqueSubjects = [...new Set(cleanedSubjects)].filter(subject => subject !== 'General');
    
    res.status(200).json(['All', ...uniqueSubjects]);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
};
