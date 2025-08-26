// Starfield animation functionality
import { Utils } from './utils.js';

export class Starfield {
    constructor() {
        this.canvas = document.getElementById('starfield');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.animationId = null;
        this.stars = [];
        this.shootingStars = [];
        
        this.numStars = window.CONFIG.ANIMATION.STARFIELD.NUM_STARS || 150;
        this.numShootingStars = window.CONFIG.ANIMATION.STARFIELD.NUM_SHOOTING_STARS || 2;
        
        if (this.canvas && this.ctx) {
            this.init();
        }
    }

    init() {
        this.resizeCanvas();
        this.setupEventListeners();
        this.draw();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.createStars();
        this.createShootingStars();
    }

    setupEventListeners() {
        const debouncedResize = Utils.debounce(() => this.resizeCanvas(), 100);
        window.addEventListener('resize', debouncedResize);
    }

    createStars() {
        this.stars = [];
        for (let i = 0; i < this.numStars; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width, y: Math.random() * this.canvas.height,
                radius: Math.random() * 1.2 + 0.3, vx: (Math.random() - 0.5) * 0.1,
                vy: (Math.random() - 0.5) * 0.1, alpha: Math.random() * 0.7 + 0.3,
                twinkleSpeed: Math.random() * 0.02 + 0.005
            });
        }
    }

    createShootingStar() {
        return {
            x: Math.random() * this.canvas.width + this.canvas.width / 2, y: Math.random() * this.canvas.height / 2,
            len: Math.random() * 80 + 20, speed: Math.random() * 8 + 6,
            opacity: Math.random() * 0.6 + 0.2
        };
    }

    createShootingStars() {
        this.shootingStars = [];
        for (let i = 0; i < this.numShootingStars; i++) {
            this.shootingStars.push(this.createShootingStar());
        }
    }

    draw() {
        if (!this.ctx) return;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
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
        
        this.animationId = requestAnimationFrame(() => this.draw());
    }

    pause() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    resume() {
        if (!this.animationId) {
            this.draw();
        }
    }
}