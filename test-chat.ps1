Write-Host "Testing chat API with sample article content..."

$body = @{
    message = "What is this article about?"
    articleContent = "This is a test article about computer networks. It covers OSI model, data flow, and network types. The article explains how data moves through different layers and protocols."
    conversationHistory = @()
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/chat" -Method POST -Body $body -ContentType "application/json"
    Write-Host "Chat API Response:"
    Write-Host $response.response
} catch {
    Write-Host "Error testing chat API:"
    Write-Host $_.Exception.Message
}
