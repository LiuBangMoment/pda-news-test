async function loadComponent(id, file) {
    const el = document.getElementById(id);
    if (!el) return;
    try {
        const response = await fetch(file);
        if (response.ok) {
            const html = await response.text();
            el.innerHTML = html;
            return true;
        }
    } catch (err) {
        console.error(`Failed to load component: ${file}`, err);
    }
    return false;
}

function setActiveNav() {
    const body = document.body;
    const navKey = body.getAttribute('data-nav');
    if (!navKey) return;
    
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.getAttribute('data-nav') === navKey) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Re-initialize scripts that depend on the injected HTML
function initInjectedScripts() {
    // 1. Initialize AQI components (Ticker and Panel)
    if (typeof window.initAQI === 'function') {
        window.initAQI();
    }

    // 2. Re-initialize Nav scrolling
    const nav = document.querySelector('.nav-strip');
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

    // 3. Trigger relative time update
    if (typeof updateRelativeTimes === 'function') updateRelativeTimes();
}

document.addEventListener('DOMContentLoaded', async () => {
    const headerLoaded = await loadComponent('header-placeholder', 'components/header.html');
    const footerLoaded = await loadComponent('footer-placeholder', 'components/footer.html');
    
    if (headerLoaded) {
        setActiveNav();
    }
    
    initInjectedScripts();
});
