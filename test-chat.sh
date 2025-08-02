# Test Chat API

echo "Testing chat API with sample article content..."

curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is this article about?",
    "articleContent": "This is a test article about computer networks. It covers OSI model, data flow, and network types. The article explains how data moves through different layers and protocols.",
    "conversationHistory": []
  }'
