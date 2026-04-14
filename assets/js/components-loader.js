// Function to get the root path relative to the current file
function getRootPath() {
    const script = document.querySelector('script[src*="components-loader.js"]');
    if (script) {
        const src = script.src;
        const target = 'assets/js/components-loader.js';
        const index = src.indexOf(target);
        if (index !== -1) {
            return src.substring(0, index);
        }
    }
    return '';
}

async function loadComponent(id, file) {
    const el = document.getElementById(id);
    if (!el) return;
    try {
        const root = getRootPath();
        const url = root + file;
        const response = await fetch(url);
        if (response.ok) {
            let html = await response.text();
            if (root !== "") {
                html = html.replace(/(src|href)="(?!\/|http|https)([^"]+)"/g, `$1="${root}$2"`);
            }
            el.innerHTML = html;
            return true;
        }
    } catch (err) {
        console.error(`Error fetching component: ${file}`, err);
    }
    return false;
}

function setActiveNav() {
    const body = document.body;
    const navKey = body.getAttribute('data-nav');
    
    // Check if we are on category page
    const params = new URLSearchParams(window.location.search);
    const topic = params.get('topic');
    
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        const itemNav = item.getAttribute('data-nav');
        if (itemNav === navKey || (topic && itemNav.toLowerCase() === topic.toLowerCase())) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Helper for responsive images
function getResponsiveImg(basePath, alt, className = "", style = "") {
    if (!basePath) return "";
    const root = getRootPath();
    const fullPath = basePath.startsWith('http') ? basePath : root + basePath;
    
    return `<img src="${fullPath}" 
                 alt="${alt}" 
                 class="${className}" 
                 ${style ? `style="${style}"` : ""}>`;
}

// Optimization: Shared Card Builder
function renderArticleCard(art, root) {
    const fullUrl = art.url.startsWith('http') ? art.url : root + art.url;
    const imgHtml = getResponsiveImg(art.img, art.title, "", art.imgStyle);
    return `
        <a href="${fullUrl}" class="card article-link">
            <div class="card-thumb">
                ${imgHtml}
                <span class="card-cat">${art.category}</span>
            </div>
            <p class="card-hl">${art.title}</p>
            <span class="card-time" data-datetime="${art.date}"></span>
        </a>
    `;
}

// Optimization: Debounce helper
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function populateRelatedStories() {
    const container = document.querySelector('.related-section');
    if (!container || typeof ARTICLES === 'undefined') return;

    const root = getRootPath();
    const currentPath = window.location.pathname;
    const currentFile = currentPath.split('/').pop() || 'index.html';
    
    const currentArticle = ARTICLES.find(a => a.url === currentFile);
    const currentCategory = currentArticle ? currentArticle.category : null;
    const currentTags = currentArticle ? currentArticle.tags || [] : [];
    
    const others = ARTICLES.filter(a => a.url !== currentFile);

    // Filter by same category OR shared tags
    let relatedPool = others.filter(a => {
        const sameCategory = currentCategory && a.category === currentCategory;
        const sharedTags = a.tags && a.tags.some(t => currentTags.includes(t));
        return sameCategory || sharedTags;
    });

    // Randomize results
    relatedPool = relatedPool.sort(() => 0.5 - Math.random());

    // Fill with random others if needed
    if (relatedPool.length < 4) {
        const remaining = others.filter(a => !relatedPool.includes(a))
                                .sort(() => 0.5 - Math.random());
        relatedPool = relatedPool.concat(remaining);
    }

    const selected = relatedPool.slice(0, 4);
    if (selected.length === 0) return;

    let html = `
        <div class="section-label">
            <span class="section-label-text">More Stories</span>
            <span class="section-label-line"></span>
        </div>
        <div class="card-grid">
    `;
    
    selected.forEach(art => {
        html += renderArticleCard(art, root);
    });

    html += '</div>';
    container.innerHTML = html;
}

function populateCategoryPage() {
    const params = new URLSearchParams(window.location.search);
    const topic = params.get('topic');
    if (!topic || !document.getElementById('categoryTitle')) return;

    const root = getRootPath();
    const titleEl = document.getElementById('categoryTitle');
    const descEl = document.getElementById('categoryDescription');
    
    titleEl.textContent = topic;
    titleEl.classList.add('fade-in');

    let topicArticles = [];
    let customDesc = `The latest news, analysis, and reports from ${topic}.`;

    if (topic === "Top Stories") {
        const topIds = (typeof SECTION_CONFIG !== 'undefined' && SECTION_CONFIG.topStories) || [];
        const curated = ARTICLES.filter(a => topIds.includes(a.id));
        
        // Fill up to 15 with latest non-curated articles
        const latest = ARTICLES.filter(a => !topIds.includes(a.id)).slice(0, 15 - curated.length);
        topicArticles = [...curated, ...latest].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        customDesc = "The most essential stories from Nigeria and the world, curated for you.";
    } else if (topic === "All News") {
        topicArticles = ARTICLES;
        customDesc = "A complete feed of the latest reporting and analysis from Forward!";
    } else {
        // Filter by Category OR Tag
        topicArticles = ARTICLES.filter(a => 
            a.category.toLowerCase() === topic.toLowerCase() || 
            (a.tags && a.tags.some(t => t.toLowerCase() === topic.toLowerCase()))
        );
    }
    
    if (descEl) {
        descEl.textContent = customDesc;
        descEl.classList.add('fade-in');
    }
    document.title = `${topic} — Forward!`;

    if (topicArticles.length === 0) {
        if (descEl) descEl.textContent = `No articles found in ${topic}.`;
        return;
    }

    // Featured Article (most recent)
    const featured = topicArticles[0];
    const featuredEl = document.getElementById('categoryFeatured');
    if (featuredEl) {
        const fullUrl = featured.url.startsWith('http') ? featured.url : root + featured.url;
        featuredEl.innerHTML = `
            <a href="${fullUrl}" class="topic-featured article-link">
                ${getResponsiveImg(featured.img, featured.title, "topic-featured-img", featured.imgStyle)}
                <div class="topic-featured-kicker">COVER STORY</div>
                <h2 class="topic-featured-hl">${featured.title}</h2>
                <p class="topic-featured-deck">${featured.deck || ""}</p>
                <div class="topic-featured-meta">
                    <span>By <b>${featured.author}</b></span>
                    <span>·</span>
                    <span data-datetime="${featured.date}"></span>
                </div>
            </a>
        `;
    }

    // Sidebar (next up to 4)
    const sidebarList = document.getElementById('sidebarList');
    if (sidebarList) {
        const sidebarArticles = topicArticles.slice(1, 5);
        sidebarList.innerHTML = sidebarArticles.map(a => {
            const fullUrl = a.url.startsWith('http') ? a.url : root + a.url;
            return `
                <a href="${fullUrl}" class="sidebar-article article-link">
                    <h3 class="sidebar-hl">${a.title}</h3>
                    <div class="sidebar-meta" data-datetime="${a.date}"></div>
                </a>
            `;
        }).join('');
        document.getElementById('sidebarTitle').textContent = `Latest in ${topic}`;
    }

    // Grid (remaining or fallback)
    const grid = document.getElementById('categoryGrid');
    const list = document.getElementById('categoryList');
    const listLabel = document.getElementById('categoryListLabel');

    if (grid) {
        const gridArticles = topicArticles.slice(5, 9);
        let pool = [];
        
        const gridHeader = document.querySelector('#categoryGrid').previousElementSibling;
        const labelText = gridHeader ? gridHeader.querySelector('.section-label-text') : null;

        if (gridArticles.length > 0) {
            pool = gridArticles;
            if (labelText) labelText.textContent = `More in ${topic}`;
        } else {
            // Show random others but change the label if they are unrelated
            if (labelText) labelText.textContent = "Recommended for You";
            
            // Prioritize articles that share NO tags with the excluded topic to avoid bleed
            pool = ARTICLES.filter(a => !topicArticles.includes(a))
                           .sort(() => 0.5 - Math.random())
                           .slice(0, 4);
        }

        grid.innerHTML = pool.map(art => renderArticleCard(art, root)).join('');

        // Populate List with anything past the grid
        if (list) {
            const extraArticles = topicArticles.slice(9);
            if (extraArticles.length > 0) {
                if (listLabel) listLabel.style.display = 'flex';
                list.innerHTML = extraArticles.map((art, index) => {
                    const fullUrl = art.url.startsWith('http') ? art.url : root + art.url;
                    return `
                        <a href="${fullUrl}" class="list-article article-link">
                            <span class="list-num">${index + 10}</span>
                            <div class="list-content">
                                <div class="list-cat">${art.category}</div>
                                <div class="list-hl">${art.title}</div>
                                <div class="list-meta" data-datetime="${art.date}"></div>
                            </div>
                        </a>
                    `;
                }).join('');
            } else {
                if (listLabel) listLabel.style.display = 'none';
                list.innerHTML = '';
            }
        }
    }
}

function populateArchivePage() {
    const listContainer = document.getElementById('archiveList');
    const statsContainer = document.getElementById('archiveStats');
    const searchInput = document.getElementById('archiveSearch');
    
    if (!listContainer || typeof ARTICLES === 'undefined') return;

    const root = getRootPath();

    function renderArchive(articlesToRender) {
        if (articlesToRender.length === 0) {
            listContainer.innerHTML = '<div class="loading-state">No archived stories match your criteria.</div>';
            if (statsContainer) statsContainer.textContent = 'Showing 0 stories';
            return;
        }

        listContainer.innerHTML = articlesToRender.map(art => {
            const fullUrl = art.url.startsWith('http') ? art.url : root + art.url;
            const dateObj = new Date(art.date);
            const dateStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).toUpperCase();
            
            return `
                <a href="${fullUrl}" class="archive-item article-link">
                    <div class="archive-date">${dateStr}</div>
                    <div class="archive-hl">${art.title}</div>
                    <div class="archive-meta">
                        <span class="archive-cat-tag">${art.category}</span> · ${art.author}
                    </div>
                </a>
            `;
        }).join('');

        if (statsContainer) {
            statsContainer.textContent = `Showing ${articlesToRender.length} stor${articlesToRender.length === 1 ? 'y' : 'ies'}`;
        }
    }

    // Initial render (all articles)
    renderArchive(ARTICLES);

    // Search logic with Debouncing
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            const query = e.target.value.toLowerCase().trim();
            const filtered = ARTICLES.filter(a => 
                a.title.toLowerCase().includes(query) || 
                a.category.toLowerCase().includes(query) ||
                a.author.toLowerCase().includes(query) ||
                (a.tags && a.tags.some(t => t.toLowerCase().includes(query)))
            );
            renderArchive(filtered);
        }, 150));
    }
}

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    if (!searchInput || !searchResults) return;

    const root = getRootPath();

    searchInput.addEventListener('input', debounce((e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query.length < 2) {
            searchResults.classList.remove('active');
            return;
        }

        const matches = ARTICLES.filter(a => 
            a.title.toLowerCase().includes(query) || 
            a.category.toLowerCase().includes(query) ||
            (a.tags && a.tags.some(t => t.toLowerCase().includes(query))) ||
            (a.deck && a.deck.toLowerCase().includes(query))
        ).slice(0, 8);

        if (matches.length > 0) {
            searchResults.innerHTML = matches.map(a => {
                const fullUrl = a.url.startsWith('http') ? a.url : root + a.url;
                return `
                    <a href="${fullUrl}" class="search-result-item">
                        <div class="search-result-hl">${a.title}</div>
                        <div class="search-result-meta">${a.category} · ${a.author}</div>
                    </a>
                `;
            }).join('');
            searchResults.classList.add('active');
        } else {
            searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
            searchResults.classList.add('active');
        }
    }, 150));

    // Close results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove('active');
        }
    });
}

function initInjectedScripts() {
    const nav = document.querySelector('.nav-links-scroll');
    if (nav) {
        let isDown = false, startX, scrollLeft;
        nav.addEventListener('mousedown', e => {
            isDown = true;
            nav.style.cursor = 'grabbing';
            startX = e.pageX - nav.offsetLeft;
            scrollLeft = nav.scrollLeft;
        });
        nav.addEventListener('mouseleave', () => { isDown = false; nav.style.cursor = ''; });
        nav.addEventListener('mouseup', () => { isDown = false; nav.style.cursor = ''; });
        nav.addEventListener('mousemove', e => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - nav.offsetLeft;
            nav.scrollLeft = scrollLeft - (x - startX);
        });
    }

    if (typeof updateRelativeTimes === 'function') updateRelativeTimes();
    if (typeof updateBreakingNews === 'function') updateBreakingNews();
    
    initSearch();
    populateRelatedStories();
    populateCategoryPage();
    populateArchivePage();

    if (typeof window.initAQI === 'function') window.initAQI();
}

function loadHead() {
    const root = getRootPath();
    const faviconUrl = root + 'assets/img/pda-logo.webp';
    
    // Modern standard for favicons
    let link = document.querySelector("link[rel='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/webp';
        document.head.prepend(link); // Put it at the top of the head
    }
    link.href = faviconUrl;
}

// Immediately inject head elements (like favicon) before DOMContentLoaded
loadHead();

function populateIndex() {
    if (document.body.getAttribute('data-nav') !== 'index' || typeof ARTICLES === 'undefined') return;

    const root = getRootPath();

    // Determine Headliner (Config override OR latest)
    let headlinerArt = ARTICLES[0];
    const config = typeof SECTION_CONFIG !== 'undefined' ? SECTION_CONFIG['index'] : null;
    if (config && config.featuredId) {
        const found = ARTICLES.find(a => a.id === config.featuredId);
        if (found) headlinerArt = found;
    }

    // 1. Headliner
    const headliner = document.getElementById('indexHeadliner');
    if (headliner && ARTICLES.length > 0) {
        const art = headlinerArt;
        const fullUrl = art.url.startsWith('http') ? art.url : root + art.url;
        headliner.href = fullUrl;
        headliner.classList.remove('loading');
        headliner.classList.add('fade-in');
        headliner.innerHTML = `
            <div class="headliner-img-placeholder">
                ${getResponsiveImg(art.img, art.title, "", art.imgStyle)}
                <span class="headliner-label">Cover Story</span>
            </div>
            <div class="headliner-body">
                <div class="headliner-kicker">${art.category.toUpperCase()}</div>
                <h1 class="headliner-headline">${art.title}</h1>
                <p class="headliner-deck">${art.deck || ""}</p>
                <div class="headliner-meta">
                    <span class="headliner-meta-author">${art.author}</span>
                    <span>·</span>
                    <span data-datetime="${art.date}"></span>
                </div>
            </div>
        `;
    }

    // Pool for top stories and latest (excludes headliner)
    const otherArticles = ARTICLES.filter(a => a.id !== headlinerArt.id);

    // 2. Top Stories (Next 4)
    const topStories = document.getElementById('indexTopStories');
    if (topStories && otherArticles.length > 0) {
        const stories = otherArticles.slice(0, 4);
        topStories.innerHTML = stories.map(art => renderArticleCard(art, root)).join('');
    }

    // 3. Latest List (Following 5)
    const latestList = document.getElementById('latestList');
    if (latestList && otherArticles.length > 4) {
        const stories = otherArticles.slice(4, 9);
        latestList.innerHTML = stories.map((art, index) => {
            const fullUrl = art.url.startsWith('http') ? art.url : root + art.url;
            return `
                <a href="${fullUrl}" class="list-article article-link">
                    <span class="list-num">${index + 1}</span>
                    <div class="list-content">
                        <div class="list-cat">${art.category}</div>
                        <div class="list-hl">${art.title}</div>
                        <div class="list-meta" data-datetime="${art.date}"></div>
                    </div>
                </a>
            `;
        }).join('');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    loadHead();
    // Optimization: Parallel loading
    await Promise.all([
        loadComponent('header-placeholder', 'components/header.html'),
        loadComponent('footer-placeholder', 'components/footer.html')
    ]);
    setActiveNav();
    populateIndex();
    initInjectedScripts();
});
