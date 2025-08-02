# Deciphxr - AI Generated Lecture Notes

A modern web application for displaying AI-generated lecture notes from a MongoDB database. Built with Express.js backend and vanilla JavaScript frontend, optimized for Vercel deployment.

## 🚀 Features

- Display articles from MongoDB database in descending order (most recently added first)
- Filter articles by subject (tag functionality)
- Search through articles by title, content, and tags
- Markdown formatting support for article content
- **AI-powered chatbot** for article Q&A using Google Gemini API
- Responsive design with dark/light theme toggle
- Clean, modern UI with glassmorphism effects
- Instagram integration in footer

## 🛠 Tech Stack

- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **AI:** Google Gemini API for chatbot functionality
- **Deployment:** Vercel
- **Styling:** Custom CSS with CSS Variables

## 📁 Project Structure

```
├── api/                    # Vercel serverless functions
│   ├── articles.js        # Articles API endpoint
│   ├── subjects.js        # Subjects API endpoint
│   └── chat.js           # AI chatbot API endpoint
├── public/                # Static files
│   ├── index.html         # Main HTML file
│   ├── app.js            # Frontend JavaScript
│   ├── style.css         # Styling
│   └── static/           # Images and assets
├── package.json          # Dependencies and scripts
├── vercel.json          # Vercel configuration
├── server.js            # Express server (for local dev)
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## 🔧 Local Development

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account and connection string

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd deciphxr-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   mongo_uri=your_mongodb_atlas_connection_string
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🚀 Vercel Deployment

### Quick Deploy

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variable: `mongo_uri` with your MongoDB connection string
   - Deploy!

### Manual Configuration

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```
4. **Set environment variables:**
   ```bash
   vercel env add mongo_uri
   ```

### Environment Variables

Set these in your Vercel dashboard:

- `mongo_uri`: Your MongoDB Atlas connection string
- `GEMINI_API_KEY`: Your Google Gemini API key for the chatbot functionality

## 📊 Database Schema

Your MongoDB collection should have documents with this structure:

```javascript
{
  "_id": ObjectId("..."),
  "Topic": "# Your Article Title",
  "Subject": "Computer Science", 
  "Notes": "['line 1', 'line 2', '## Section Header', ...]"
}
```

### Supported Subjects

The application standardizes subjects to these categories:
- Cybersecurity
- Cloud Computing
- Computer Architecture
- Machine Learning
- Image Processing
- Computer Networking
- Software Engineering

## 🎨 Features Details

### AI-Powered Chatbot
- Context-aware conversations using Google Gemini API
- Chat button appears when viewing individual articles
- Sliding chat interface with conversation history
- Questions answered based on article content
- Responsive design with typing indicators

### Markdown Support
- Full markdown rendering with headers, lists, links, code blocks
- Automatic Python list parsing from database
- Clean text excerpts for article previews

### Search & Filter
- Real-time search across titles, content, and tags
- Dynamic subject filtering
- Case-insensitive search

### Responsive Design
- Mobile-friendly layout
- Dark/light theme toggle
- Smooth animations and transitions
- Instagram link integration

## 🔧 API Endpoints

- `GET /api/articles` - Fetch all articles with transformation
- `GET /api/subjects` - Get unique subjects for filter buttons
- `POST /api/chat` - AI chatbot for article Q&A (requires Gemini API key)

## 📱 Local Testing

Use the included batch file for easy startup:
```bash
./start.bat
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

**Nowaysid** - [@nowaysid](https://instagram.com/nowaysid)

---

### Quick Start Checklist

- [ ] Clone repository
- [ ] Install dependencies (`npm install`)
- [ ] Set up `.env` with MongoDB URI
- [ ] Test locally (`npm run dev`)
- [ ] Push to GitHub
- [ ] Deploy to Vercel
- [ ] Add environment variables in Vercel
- [ ] Enjoy your deployed app! 🎉
