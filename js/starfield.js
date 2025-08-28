// Starfield animation functionality
import { Utils } from './utils.js';

/**
 * Class for creating and managing a starfield animation
 */
export class Starfield {
    /**
     * Create a Starfield
     */
    constructor() {
        this.canvas = document.getElementById('starfield');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.animationId = null;
        this.stars = [];
        this.shootingStars = [];
        
        // Reduce number of stars and shooting stars on mobile devices for better performance
        this.isMobile = this.isMobileDevice();
        this.numStars = this.isMobile ? 50 : (window.CONFIG.ANIMATION.STARFIELD.NUM_STARS || 150);
        this.numShootingStars = this.isMobile ? 1 : (window.CONFIG.ANIMATION.STARFIELD.NUM_SHOOTING_STARS || 2);
        
        if (this.canvas && this.ctx) {
            this.init();
        }
    }

    /**
     * Detect if user is on a mobile device
     * @returns {boolean} - True if user is on mobile device
     */
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Initialize the starfield
     */
    init() {
        this.resizeCanvas();
        this.setupEventListeners();
        this.draw();
        
        // On mobile devices, pause animation when page is not visible to save resources
        if (this.isMobile) {
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.pause();
                } else {
                    this.resume();
                }
            });
        }
    }

    /**
     * Resize the canvas to match window dimensions
     */
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.createStars();
        this.createShootingStars();
    }

    /**
     * Set up event listeners for window resize
     */
    setupEventListeners() {
        const debouncedResize = Utils.debounce(() => this.resizeCanvas(), 100);
        window.addEventListener('resize', debouncedResize);
    }

    /**
     * Create stars for the starfield
     */
    createStars() {
        this.stars = [];
        // Reduce number of stars even further on mobile for better performance
        const starCount = this.isMobile ? Math.floor(this.numStars / 3) : this.numStars;
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width, y: Math.random() * this.canvas.height,
                radius: Math.random() * 1.2 + 0.3, vx: (Math.random() - 0.5) * 0.1,
                vy: (Math.random() - 0.5) * 0.1, alpha: Math.random() * 0.7 + 0.3,
                twinkleSpeed: Math.random() * 0.02 + 0.005
            });
        }
    }

    /**
     * Create a shooting star
     * @returns {Object} Shooting star object
     */
    createShootingStar() {
        // Reduce shooting star size on mobile for better performance
        const len = this.isMobile ? Math.random() * 40 + 10 : Math.random() * 80 + 20;
        const speed = this.isMobile ? Math.random() * 4 + 3 : Math.random() * 8 + 6;
        
        return {
            x: Math.random() * this.canvas.width + this.canvas.width / 2, 
            y: Math.random() * this.canvas.height / 2,
            len: len,
            speed: speed,
            opacity: Math.random() * 0.6 + 0.2
        };
    }

    /**
     * Create shooting stars for the starfield
     */
    createShootingStars() {
        this.shootingStars = [];
        for (let i = 0; i < this.numShootingStars; i++) {
            this.shootingStars.push(this.createShootingStar());
        }
    }

    /**
     * Draw the starfield animation
     */
    draw() {
        if (!this.ctx) return;
        
        // On mobile devices, use a simpler clear operation for better performance
        if (this.isMobile) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        this.stars.forEach(star => {
            star.alpha += star.twinkleSpeed;
            if (star.alpha > 1 || star.alpha < 0.3) star.twinkleSpeed *= -1;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            this.ctx.fill();
            star.x += star.vx; star.y += star.vy;
            if (star.x < 0) star.x = this.canvas.width; if (star.x > this.canvas.width) star.x = 0;
            if (star.y < 0) star.y = this.canvas.height; if (star.y > this.canvas.height) star.y = 0;
        });

        // Only draw shooting stars if not on mobile or if we have very few of them
        if (!this.isMobile || this.shootingStars.length <= 1) {
            this.shootingStars.forEach((star, index) => {
                star.x -= star.speed; star.y += star.speed * 0.4;
                const gradient = this.ctx.createLinearGradient(star.x, star.y, star.x + star.len, star.y - star.len * 0.4);
                gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                this.ctx.strokeStyle = gradient; this.ctx.lineWidth = 1.5; this.ctx.lineCap = 'round';
                this.ctx.beginPath(); this.ctx.moveTo(star.x, star.y); this.ctx.lineTo(star.x + star.len, star.y - star.len * 0.4);
                this.ctx.stroke();
                if (star.x < -star.len || star.y > window.innerHeight + star.len) {
                    this.shootingStars[index] = this.createShootingStar();
                }
            });
        }
        
        // On mobile devices, reduce frame rate to improve performance
        if (this.isMobile) {
            setTimeout(() => {
                this.animationId = requestAnimationFrame(() => this.draw());
            }, 1000 / 20); // 20 FPS on mobile for better performance
        } else {
            this.animationId = requestAnimationFrame(() => this.draw());
        }
    }

    /**
     * Pause the starfield animation
     */
    pause() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Resume the starfield animation
     */
    resume() {
        if (!this.animationId) {
            this.draw();
        }
    }
}