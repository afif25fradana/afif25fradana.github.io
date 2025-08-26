// UI-related functionality
export class UI {
    constructor() {
        this.setupNavigation();
        this.setupBackToTop();
        this.setupSectionVisibility();
        this.setFooterYear();
        this.setupLoadingOverlay();
    }

    setFooterYear() {
        const currentYearEl = document.getElementById('current-year');
        if(currentYearEl) {
            currentYearEl.textContent = new Date().getFullYear();
        }
    }

    setupLoadingOverlay() {
        const loadingOverlay = document.getElementById('loading-overlay');
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (loadingOverlay) {
                    loadingOverlay.classList.add('hidden');
                }
            }, 500);
        });
    }

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
            });
        });

        // Set initial active nav link based on current hash or default to #hero
        const initialHash = window.location.hash || '#hero';
        const initialNavLink = document.querySelector(`nav a.nav-link[href="${initialHash}"]`);
        if (initialNavLink) {
            initialNavLink.classList.add('active');
        }
    }

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

    setupSectionVisibility() {
        const sections = document.querySelectorAll('section');

        const observerOptions = {
            root: null, // viewport
            rootMargin: '0px',
            threshold: window.CONFIG.UI.SECTION_INTERSECTION_THRESHOLD || 0.1 // 10% of the section must be visible
        };

        const sectionObserver = new IntersectionObserver((entries, observer) => {
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
}