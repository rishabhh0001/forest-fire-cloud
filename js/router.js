/**
 * ForestGuard Router - Lightweight SPA Router
 * Handles hash-based navigation with page transitions
 */

class Router {
    constructor() {
        this.routes = {};
        this.currentPage = null;
        this.pageContainer = document.getElementById('page-container');

        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => this.handleRoute());
    }

    register(path, handler) {
        this.routes[path] = handler;
    }

    async handleRoute() {
        const hash = window.location.hash.slice(1) || 'dashboard';
        const handler = this.routes[hash] || this.routes['dashboard'];

        // Page transition out
        if (this.pageContainer) {
            this.pageContainer.style.opacity = '0';
            this.pageContainer.style.transform = 'translateY(20px)';
        }

        await new Promise(resolve => setTimeout(resolve, 200));

        // Update active nav
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.parentElement.classList.remove('active');
            if (link.getAttribute('href') === `#${hash}`) {
                link.parentElement.classList.add('active');
            }
        });

        // Load new page
        if (handler) {
            await handler();
        }

        // Page transition in
        if (this.pageContainer) {
            this.pageContainer.style.opacity = '1';
            this.pageContainer.style.transform = 'translateY(0)';
        }

        this.currentPage = hash;
    }

    navigate(path) {
        window.location.hash = path;
    }
}

// Global router instance
const router = new Router();
