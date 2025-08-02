// State management
let blogPosts = [];
let categories = ['All'];
let currentFilter = 'All';
let currentSearch = '';
let filteredPosts = [];

// DOM elements
const blogGrid = document.getElementById('blog-grid');
const filterButtons = document.getElementById('filter-buttons');
const searchInput = document.getElementById('search-input');
const homePage = document.getElementById('home-page');
const blogPage = document.getElementById('blog-page');
const blogContent = document.getElementById('blog-content');
const backButton = document.getElementById('back-button');
const noResults = document.getElementById('no-results');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const header = document.querySelector('.header');

// API functions
async function fetchArticles() {
    try {
        const response = await fetch('/api/articles');
        if (!response.ok) {
            throw new Error('Failed to fetch articles');
        }
        blogPosts = await response.json();
        filteredPosts = [...blogPosts];
        return blogPosts;
    } catch (error) {
        console.error('Error fetching articles:', error);
        // Show error message to user
        blogGrid.innerHTML = '<div class="error-message">Failed to load articles. Please try again later.</div>';
        return [];
    }
}

async function fetchSubjects() {
    try {
        const response = await fetch('/api/subjects');
        if (!response.ok) {
            throw new Error('Failed to fetch subjects');
        }
        categories = await response.json();
        return categories;
    } catch (error) {
        console.error('Error fetching subjects:', error);
        return ['All'];
    }
}

// Initialize the application
async function init() {
    showLoading();
    await fetchSubjects();
    await fetchArticles();
    hideLoading();
    renderFilterButtons();
    renderBlogPosts();
    attachEventListeners();
    initTheme();
}

// Show loading state
function showLoading() {
    blogGrid.innerHTML = '<div class="loading">Loading articles...</div>';
}

// Hide loading state
function hideLoading() {
    // Loading will be replaced by content
}

// Render filter buttons
function renderFilterButtons() {
    filterButtons.innerHTML = categories.map(category => 
        `<button class="filter-btn ${category === currentFilter ? 'active' : ''}" 
                 data-category="${category}">
            ${category}
        </button>`
    ).join('');
}

// Render blog posts
function renderBlogPosts() {
    if (filteredPosts.length === 0) {
        blogGrid.innerHTML = '';
        noResults.classList.remove('hidden');
        return;
    }

    noResults.classList.add('hidden');
    
    blogGrid.innerHTML = filteredPosts.map(post => `
        <article class="card blog-card" data-post-id="${post.id}">
            <div class="blog-card__content">
                <div class="blog-card__category">${post.category}</div>
                <h3 class="blog-card__title">${post.title}</h3>
                <p class="blog-card__excerpt">${post.excerpt}</p>
                <div class="blog-card__meta">
                    <span>${formatDate(post.date)}</span>
                    <span>${post.readTime}</span>
                </div>
            </div>
        </article>
    `).join('');
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Filter posts based on search and category
function filterPosts() {
    filteredPosts = blogPosts.filter(post => {
        const matchesCategory = currentFilter === 'All' || post.category === currentFilter;
        const matchesSearch = currentSearch === '' || 
            post.title.toLowerCase().includes(currentSearch.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(currentSearch.toLowerCase()) ||
            post.content.toLowerCase().includes(currentSearch.toLowerCase()) ||
            post.tags.some(tag => tag.toLowerCase().includes(currentSearch.toLowerCase()));
        
        return matchesCategory && matchesSearch;
    });
    
    renderBlogPosts();
}

// Show blog post
function showBlogPost(postId) {
    console.log('showBlogPost called with postId:', postId);
    const post = blogPosts.find(p => p.id === postId);
    if (!post) {
        console.error('Post not found with id:', postId);
        return;
    }

    console.log('Found post:', post.title);

    // Format content using marked.js for markdown parsing
    const formattedContent = marked.parse(post.content);
    
    blogContent.innerHTML = `
        <header class="blog-post__header">
            <div class="blog-post__meta">
                <span class="blog-card__category">${post.category}</span>
                <span>${formatDate(post.date)}</span>
                <span>${post.readTime}</span>
            </div>
            <h1 class="blog-post__title">${post.title}</h1>
            <p class="blog-post__excerpt">${post.excerpt}</p>
            <div class="tags">
                ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </header>
        <div class="blog-post__body">
            ${formattedContent}
        </div>
    `;

    // Set current article content for chat
    currentArticleContent = post.content;
    console.log('Setting article content for chat');
    
    // Reset chat for new article (but don't hide the button)
    resetChatMessages();
    
    // Show chat button
    if (chatButton) {
        console.log('Showing chat button');
        chatButton.classList.remove('hidden');
        chatButton.style.display = 'flex'; // Force display
        console.log('Chat button classes after showing:', chatButton.classList.toString());
        console.log('Chat button style.display:', chatButton.style.display);
    } else {
        console.error('chatButton not found when trying to show it');
    }

    homePage.classList.add('hidden');
    blogPage.classList.remove('hidden');
    window.scrollTo(0, 0);
    header.classList.add('header--collapsed');
}

// Show home page
function showHomePage() {
    blogPage.classList.add('hidden');
    homePage.classList.remove('hidden');
    window.scrollTo(0, 0);
    header.classList.remove('header--collapsed');
    
    // Hide chat button and reset chat when returning to home
    resetChat();
}

// Theme management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-color-scheme', theme);
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-color-scheme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

// Event listeners
function attachEventListeners() {
    // Filter buttons
    filterButtons.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            const category = e.target.dataset.category;
            currentFilter = category;
            
            // Update active button
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            e.target.classList.add('active');
            
            filterPosts();
        }
    });

    // Search input
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        filterPosts();
    });

    // Blog cards
    blogGrid.addEventListener('click', (e) => {
        console.log('Blog grid clicked, target:', e.target);
        const card = e.target.closest('.blog-card');
        console.log('Found card:', card);
        if (card) {
            const postId = card.dataset.postId;
            console.log('Post ID:', postId);
            showBlogPost(postId);
        } else {
            console.log('No card found for click target');
        }
    });

    // Back button
    backButton.addEventListener('click', showHomePage);

    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !blogPage.classList.contains('hidden')) {
            showHomePage();
        }
        if (e.key === 'Escape' && chatSlider.classList.contains('active')) {
            closeChatSlider();
        }
    });

    // Chat functionality
    initChat();
}

// Chat functionality
let currentArticleContent = '';
let conversationHistory = [];

// Chat DOM elements (will be initialized in initChat)
let chatButton, chatOverlay, chatSlider, chatClose, chatMessages, chatForm, chatInput, chatSend;

function initChat() {
    // Initialize chat DOM elements
    chatButton = document.getElementById('chat-button');
    chatOverlay = document.getElementById('chat-overlay');
    chatSlider = document.getElementById('chat-slider');
    chatClose = document.getElementById('chat-close');
    chatMessages = document.getElementById('chat-messages');
    chatForm = document.getElementById('chat-form');
    chatInput = document.getElementById('chat-input');
    chatSend = document.getElementById('chat-send');

    // Check if elements exist before adding event listeners
    if (!chatButton || !chatOverlay || !chatSlider || !chatClose || !chatMessages || !chatForm || !chatInput || !chatSend) {
        console.error('Chat elements not found in DOM:', {
            chatButton: !!chatButton,
            chatOverlay: !!chatOverlay,
            chatSlider: !!chatSlider,
            chatClose: !!chatClose,
            chatMessages: !!chatMessages,
            chatForm: !!chatForm,
            chatInput: !!chatInput,
            chatSend: !!chatSend
        });
        return;
    }

    console.log('Chat elements found successfully! Initializing chat...');

    chatButton.addEventListener('click', openChatSlider);
    chatClose.addEventListener('click', closeChatSlider);
    chatOverlay.addEventListener('click', closeChatSlider);
    chatForm.addEventListener('submit', sendChatMessage);
    
    // Auto-resize textarea
    chatInput.addEventListener('input', autoResizeTextarea);
    
    // Enter to send (Shift+Enter for new line)
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage(e);
        }
    });
}

function openChatSlider() {
    if (chatOverlay && chatSlider && chatInput) {
        chatOverlay.classList.add('active');
        chatSlider.classList.add('active');
        chatInput.focus();
    }
}

function closeChatSlider() {
    if (chatOverlay && chatSlider) {
        chatOverlay.classList.remove('active');
        chatSlider.classList.remove('active');
    }
}

function autoResizeTextarea() {
    if (chatInput) {
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
    }
}

async function sendChatMessage(e) {
    e.preventDefault();
    
    const message = chatInput.value.trim();
    if (!message || !currentArticleContent) return;
    
    // Disable input while sending
    chatSend.disabled = true;
    chatInput.disabled = true;
    
    // Add user message to chat
    addMessageToChat('user', message);
    
    // Clear input
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                articleContent: currentArticleContent,
                conversationHistory: conversationHistory
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to get response');
        }
        
        const data = await response.json();
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add assistant response
        addMessageToChat('assistant', data.response);
        
        // Update conversation history
        conversationHistory.push(
            { role: 'user', content: message },
            { role: 'assistant', content: data.response }
        );
        
        // Keep conversation history reasonable size
        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-20);
        }
        
    } catch (error) {
        console.error('Error sending message:', error);
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Show error message
        addMessageToChat('assistant', 'Sorry, I encountered an error. Please try again.');
    } finally {
        // Re-enable input
        chatSend.disabled = false;
        chatInput.disabled = false;
        chatInput.focus();
    }
}

function addMessageToChat(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}`;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Parse markdown for assistant messages, keep plain text for user messages
    const formattedContent = role === 'assistant' ? marked.parse(content) : content;
    
    messageDiv.innerHTML = `
        <div class="message-content">${formattedContent}</div>
        <div class="message-time">${timeString}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="typing-dots">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
        <span>AI is typing...</span>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function resetChat() {
    // Clear conversation history
    conversationHistory = [];
    
    // Clear messages except the initial greeting
    if (chatMessages) {
        const messages = chatMessages.querySelectorAll('.chat-message');
        messages.forEach((message, index) => {
            if (index > 0) { // Keep the first greeting message
                message.remove();
            }
        });
    }
    
    // Reset current article content
    currentArticleContent = '';
    
    // Hide chat button
    if (chatButton) {
        chatButton.classList.add('hidden');
    }
    
    // Close chat if open
    closeChatSlider();
}

function resetChatMessages() {
    // Clear conversation history
    conversationHistory = [];
    
    // Clear messages except the initial greeting
    if (chatMessages) {
        const messages = chatMessages.querySelectorAll('.chat-message');
        messages.forEach((message, index) => {
            if (index > 0) { // Keep the first greeting message
                message.remove();
            }
        });
    }
    
    // Close chat if open
    closeChatSlider();
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);