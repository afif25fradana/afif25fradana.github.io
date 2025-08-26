document.addEventListener('DOMContentLoaded', () => {
    const GITHUB_USERNAME = window.CONFIG.GITHUB_USERNAME;

    // Set tahun sekarang untuk footer
    const currentYearEl = document.getElementById('current-year');
    if(currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }
    
    // Sembunyikan loading overlay setelah halaman selesai dimuat
    const loadingOverlay = document.getElementById('loading-overlay');
    window.addEventListener('load', () => {
        setTimeout(() => {
            loadingOverlay.classList.add('hidden');
        }, 500);
    });


    // --- SMOOTH SCROLLING FOR NAVIGATION ---
    document.querySelectorAll('nav a.nav-link').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });

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

    // --- BACK TO TOP BUTTON ---
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) { // Show button after scrolling 300px
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

    // --- GITHUB REPOSITORIES FETCHING ---
    const githubReposContainer = document.getElementById('github-repos');

    async function fetchGitHubRepos() {
        try {
            const response = await fetch(window.CONFIG.API_ENDPOINTS.GITHUB_REPOS(GITHUB_USERNAME));
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.statusText}`);
            }
            const repos = await response.json();
            
            // Clear placeholder
            while (githubReposContainer.firstChild) {
                githubReposContainer.removeChild(githubReposContainer.firstChild);
            }

            if (repos.length === 0) {
                const noReposElement = document.createElement('p');
                noReposElement.className = 'text-slate-400 text-center col-span-full';
                noReposElement.textContent = 'No public repositories found.';
                githubReposContainer.appendChild(noReposElement);
                return;
            }

            // Create document fragment for better performance
            const fragment = document.createDocumentFragment();
            
            repos.forEach(repo => {
                const repoCard = document.createElement('div');
                repoCard.className = 'repo-card glass-container p-6 text-slate-300';
                
                const topicsHtml = repo.topics ? repo.topics.map(topic => `<span class="skill-badge">${topic}</span>`).join('') : '';
                
                repoCard.innerHTML = `
                    <h3 class="text-xl font-semibold text-white mb-2">${repo.name}</h3>
                    <p class="text-sm mb-4">${repo.description || 'No description provided.'}</p>
                    <div class="flex flex-wrap gap-2 mb-4">
                        ${repo.language ? `<span class="skill-badge">${repo.language}</span>` : ''}
                        ${topicsHtml}
                    </div>
                    <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 transition-colors duration-300">View Project <i class="fas fa-external-link-alt ml-1"></i></a>
                `;
                
                fragment.appendChild(repoCard);
            });
            
            githubReposContainer.appendChild(fragment);

        } catch (error) {
            console.error('Failed to fetch GitHub repositories:', error);
            
            // Clear container
            while (githubReposContainer.firstChild) {
                githubReposContainer.removeChild(githubReposContainer.firstChild);
            }
            
            const errorElement = document.createElement('p');
            errorElement.className = 'text-red-400 text-center col-span-full';
            errorElement.textContent = 'Failed to load repositories. Please try again later.';
            githubReposContainer.appendChild(errorElement);
        }
    }

    // Call the function to fetch repos when the page loads
    fetchGitHubRepos();

    // --- STARFIELD ANIMATION ---
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');
    let animationId;
    let stars = [];
    let shootingStars = [];

    const numStars = 150;
    const numShootingStars = 2;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        createStars();
        createShootingStars();
    }

    function debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    window.addEventListener('resize', debounce(resizeCanvas, 100));
    resizeCanvas();

    function createStars() {
        stars = [];
        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random() * canvas.width, y: Math.random() * canvas.height,
                radius: Math.random() * 1.2 + 0.3, vx: (Math.random() - 0.5) * 0.1,
                vy: (Math.random() - 0.5) * 0.1, alpha: Math.random() * 0.7 + 0.3,
                twinkleSpeed: Math.random() * 0.02 + 0.005
            });
        }
    }

    function createShootingStar() {
        return {
            x: Math.random() * canvas.width + canvas.width / 2, y: Math.random() * canvas.height / 2,
            len: Math.random() * 80 + 20, speed: Math.random() * 8 + 6,
            opacity: Math.random() * 0.6 + 0.2
        };
    }

    function createShootingStars() {
        shootingStars = [];
        for (let i = 0; i < numShootingStars; i++) {
            shootingStars.push(createShootingStar());
        }
    }

    function draw() {
        if (!ctx) return;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        stars.forEach(star => {
            star.alpha += star.twinkleSpeed;
            if (star.alpha > 1 || star.alpha < 0.3) star.twinkleSpeed *= -1;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            ctx.fill();
            star.x += star.vx; star.y += star.vy;
            if (star.x < 0) star.x = canvas.width; if (star.x > canvas.width) star.x = 0;
            if (star.y < 0) star.y = canvas.height; if (star.y > canvas.height) star.y = 0;
        });

        shootingStars.forEach((star, index) => {
            star.x -= star.speed; star.y += star.speed * 0.4;
            const gradient = ctx.createLinearGradient(star.x, star.y, star.x + star.len, star.y - star.len * 0.4);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.strokeStyle = gradient; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(star.x, star.y); ctx.lineTo(star.x + star.len, star.y - star.len * 0.4);
            ctx.stroke();
            if (star.x < -star.len || star.y > window.innerHeight + star.len) {
                shootingStars[index] = createShootingStar();
            }
        });
        animationId = requestAnimationFrame(draw);
    }
    draw();

    // --- MUSIC PLAYER ---
    const musicButton = document.getElementById('music-button');
    if(musicButton) {
        const musicText = document.getElementById('music-text');
        const musicIcon = document.getElementById('music-icon');
        let isPlaying = false, isAudioContextStarted = false, loop;
        
        const synth = new Tone.PolySynth(Tone.Synth, {
            volume: -18,
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.4 }
        }).toDestination();
        const reverb = new Tone.Reverb({ decay: 2.0, wet: 0.3 }).toDestination();
        synth.connect(reverb);
        const delay = new Tone.PingPongDelay({ delayTime: "8n", feedback: 0.3, wet: 0.25 }).toDestination();
        synth.connect(delay);

        const melody = [
            { notes: ['C4', 'E4', 'G4'], duration: '4n' }, { notes: ['A4'], duration: '8n' },
            { notes: ['G4'], duration: '8n' }, { notes: ['E4'], duration: '4n' },
            { notes: ['C4'], duration: '4n' }, { notes: ['F4', 'A4'], duration: '4n' },
            { notes: ['C5'], duration: '4n' }, { notes: ['A4'], duration: '4n' }
        ];
        
        function startMusic() {
            let step = 0;
            loop = new Tone.Loop(time => {
                const note = melody[step % melody.length];
                synth.triggerAttackRelease(note.notes, note.duration, time);
                step++;
            }, "4n").start(0);
            Tone.Transport.start();
            musicText.textContent = 'STOP AMBIENT MUSIC';
            musicIcon.classList.replace('fa-play', 'fa-pause');
            musicButton.classList.add('music-active');
            isPlaying = true;
        }

        function stopMusic() {
            if (loop) {
                loop.stop(0);
                loop.dispose();
            }
            Tone.Transport.stop();
            musicText.textContent = 'PLAY AMBIENT MUSIC';
            musicIcon.classList.replace('fa-pause', 'fa-play');
            musicButton.classList.remove('music-active');
            isPlaying = false;
        }

        musicButton.addEventListener('click', () => {
            if (!isAudioContextStarted) {
                Tone.start().then(() => {
                    isAudioContextStarted = true;
                    startMusic();
                });
            } else {
                isPlaying ? stopMusic() : startMusic();
            }
        });
        
        // Optimasi: Hentikan animasi saat tab tidak aktif
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (animationId) cancelAnimationFrame(animationId);
                animationId = null;
                if (isPlaying) stopMusic();
            } else {
                if (!animationId) draw();
            }
        });
    }

    // --- SECTION VISIBILITY ANIMATION (Intersection Observer) ---
    const sections = document.querySelectorAll('section');

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // 10% of the section must be visible
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
            } else {
                // Optional: Remove 'visible' class if you want animation to replay on scroll back
                // entry.target.classList.remove('visible');
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });
});
