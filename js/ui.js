// UI-related functionality

/**
 * Class for managing UI elements and interactions
 */
export class UI {
    /**
     * Create a UI manager
     */
    constructor() {
        this.setupNavigation();
        this.setupBackToTop();
        this.setupSectionVisibility();
        this.setFooterYear();
        this.setupLoadingOverlay();
        this.setupSmoothScrolling();
        this.setupMobileMenu();
    }

    /**
     * Set the current year in the footer
     */
    setFooterYear() {
        const currentYearEl = document.getElementById('current-year');
        if(currentYearEl) {
            currentYearEl.textContent = new Date().getFullYear();
        }
    }

    /**
     * Set up the loading overlay
     */
    setupLoadingOverlay() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            // Hide the loading overlay immediately when DOM is ready
            setTimeout(() => {
                loadingOverlay.classList.add('hidden');
            }, 500);
        }
    }

    /**
     * Set up navigation links
     */
    setupNavigation() {
        document.querySelectorAll('nav a.nav-link').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }

                // Update active class for navigation links
                document.querySelectorAll('nav a.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
                
                // Close mobile menu if open
                const mobileMenu = document.getElementById('mobile-menu');
                const mobileMenuButton = document.getElementById('mobile-menu-button');
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    mobileMenuButton.setAttribute('aria-expanded', 'false');
                }
            });
        });

        // Set initial active nav link based on current hash or default to #hero
        const initialHash = window.location.hash || '#hero';
        const initialNavLink = document.querySelector(`nav a.nav-link[href="${initialHash}"]`);
        if (initialNavLink) {
            initialNavLink.classList.add('active');
        }
    }

    /**
     * Set up the back to top button
     */
    setupBackToTop() {
        const backToTopButton = document.getElementById('back-to-top');
        if (backToTopButton) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > (window.CONFIG.UI.BACK_TO_TOP_THRESHOLD || 300)) { // Show button after scrolling 300px
                    backToTopButton.classList.add('show');
                } else {
                    backToTopButton.classList.remove('show');
                }
            });

            backToTopButton.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    /**
     * Set up section visibility based on scroll position
     */
    setupSectionVisibility() {
        const sections = document.querySelectorAll('section');

        const observerOptions = {
            root: null, // viewport
            rootMargin: '0px',
            threshold: window.CONFIG.UI.SECTION_INTERSECTION_THRESHOLD || 0.1 // 10% of the section must be visible
        };

        const sectionObserver = new IntersectionObserver((entries, _observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Update active nav link
                    const id = entry.target.id;
                    document.querySelectorAll('nav a.nav-link').forEach(link => {
                        link.classList.remove('active');
                    });
                    const correspondingLink = document.querySelector(`nav a.nav-link[href="#${id}"]`);
                    if (correspondingLink) {
                        correspondingLink.classList.add('active');
                    }
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            sectionObserver.observe(section);
        });
    }

    /**
     * Set up smooth scrolling for all links
     */
    setupSmoothScrolling() {
        // This is already handled in setupNavigation, but we can add additional smooth scrolling
        // for any other anchor links that might be added dynamically
        document.addEventListener('click', function(e) {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    }
    
    /**
     * Set up mobile hamburger menu
     */
    setupMobileMenu() {
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const closeMenuButton = document.getElementById('close-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuButton && closeMenuButton && mobileMenu) {
            // Toggle mobile menu
            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
                const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
                mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
            });
            
            // Close mobile menu
            closeMenuButton.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                mobileMenuButton.setAttribute('aria-expanded', 'false');
            });
            
            // Close menu when clicking outside
            mobileMenu.addEventListener('click', (e) => {
                if (e.target === mobileMenu) {
                    mobileMenu.classList.add('hidden');
                    mobileMenuButton.setAttribute('aria-expanded', 'false');
                }
            });
            
            // Close menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    mobileMenuButton.setAttribute('aria-expanded', 'false');
                }
            });
        }
    }
}