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
    const post = blogPosts.find(p => p.id === postId);
    if (!post) return;

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
        const card = e.target.closest('.blog-card');
        if (card) {
            const postId = card.dataset.postId;
            showBlogPost(postId);
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
    });
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);