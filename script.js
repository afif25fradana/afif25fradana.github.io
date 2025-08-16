document.addEventListener('DOMContentLoaded', () => {
    // Set tahun sekarang untuk footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Sembunyikan loading overlay setelah halaman selesai dimuat
    const loadingOverlay = document.getElementById('loading-overlay');
    window.addEventListener('load', () => {
        setTimeout(() => {
            loadingOverlay.classList.add('hidden');
        }, 500);
    });

    // --- FUNGSI TAB ---
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Hapus kelas 'active' dari semua tombol dan konten
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Tambahkan kelas 'active' ke tombol yang diklik dan konten yang sesuai
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

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
    window.addEventListener('resize', resizeCanvas);
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
    const musicText = document.getElementById('music-text');
    const musicIcon = document.getElementById('music-icon');
    let isPlaying = false, isAudioContextStarted = false, loop;
    const synth = new Tone.PolySynth(Tone.Synth, {
        volume: -18,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.4 }
    }).toDestination();
    const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.4 }).toDestination();
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
        if (loop) loop.stop(0).dispose();
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
});
