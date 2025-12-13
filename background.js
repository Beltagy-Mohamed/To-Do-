/**
 * The Achievement Galaxy 🌌
 * A creative canvas background where tasks are floating orbs and achievements are stars.
 * Supports Light & Dark Modes.
 */

// Theme Configuration
const THEMES = {
    dark: {
        bgGradient: ['#0f172a', '#020617'], // Deep Space
        orbAlpha: 0.6,
        starColor: '#fbbf24',
        starAlpha: 0.5,
        textColor: '#e2e8f0'
    },
    light: {
        bgGradient: ['#f8fafc', '#e2e8f0'], // Bright Sky
        orbAlpha: 0.8,
        starColor: '#d97706', // Golden Amber
        starAlpha: 0.3,
        textColor: '#334155'
    }
};

const GALAXY_CONFIG = {
    orbColors: ['#22d3ee', '#818cf8', '#f472b6', '#34d399'],
    particleColors: ['#fbbf24', '#f59e0b', '#ffffff'],
    orbBaseSize: 15,
    starSize: 2,
    mouseRepelRadius: 150,
    mouseRepelForce: 2
};

class Galaxy {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'galaxy-canvas';
        this.ctx = this.canvas.getContext('2d');

        // Styles
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '0'; // Changed for visibility
        this.canvas.style.pointerEvents = 'none';

        console.log("🌌 Galaxy Background Initialized");
        document.body.prepend(this.canvas);

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.orbs = [];
        this.stars = [];
        this.particles = [];

        this.mouse = { x: -1000, y: -1000 };
        this.currentTheme = 'dark'; // Default

        // Bindings
        this.resize = this.resize.bind(this);
        this.animate = this.animate.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);

        window.addEventListener('resize', this.resize);
        window.addEventListener('mousemove', this.handleMouseMove);

        this.resize();
        this.createDistantStars();
        this.animate();
    }

    setTheme(theme) {
        this.currentTheme = theme === 'light' ? 'light' : 'dark';
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    handleMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
    }

    sync(todos) {
        this.orbs = [];
        this.stars = [];
        todos.forEach(t => {
            if (t.completed) {
                this.addStar();
            } else {
                this.addOrb();
            }
        });
    }

    addOrb() {
        this.orbs.push(new FloatingOrb(this.width, this.height));
    }

    addStar(x, y) {
        const tx = x || Math.random() * this.width;
        const ty = y || Math.random() * this.height;
        this.stars.push(new Star(tx, ty));
    }

    // Create background stars that are always there
    createDistantStars() {
        for (let i = 0; i < 50; i++) {
            this.stars.push(new Star(Math.random() * this.width, Math.random() * this.height));
        }
    }

    completeTaskVisual() {
        if (this.orbs.length > 0) {
            const index = Math.floor(Math.random() * this.orbs.length);
            const orb = this.orbs[index];
            this.createExplosion(orb.x, orb.y);
            this.addStar(orb.x, orb.y);
            this.orbs.splice(index, 1);
        } else {
            this.addStar(this.width / 2, this.height / 2);
        }
    }

    addTaskVisual() {
        this.addOrb();
    }

    createExplosion(x, y) {
        for (let i = 0; i < 12; i++) {
            this.particles.push(new Particle(x, y));
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        const theme = THEMES[this.currentTheme] || THEMES['dark'];

        // Background
        const grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
        grad.addColorStop(0, theme.bgGradient[0]);
        grad.addColorStop(1, theme.bgGradient[1]);
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Stars
        this.stars.forEach(star => star.draw(this.ctx, theme));

        // Orbs
        this.orbs.forEach(orb => {
            orb.update(this.mouse);
            orb.draw(this.ctx, theme);
        });

        // Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update();
            p.draw(this.ctx);
            if (p.alpha <= 0) this.particles.splice(i, 1);
        }

        requestAnimationFrame(this.animate);
    }
}

class FloatingOrb {
    constructor(w, h) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = GALAXY_CONFIG.orbBaseSize + Math.random() * 5;
        this.color = GALAXY_CONFIG.orbColors[Math.floor(Math.random() * GALAXY_CONFIG.orbColors.length)];
        this.angle = Math.random() * Math.PI * 2;
    }

    update(mouse) {
        this.x += this.vx;
        this.y += this.vy;
        this.angle += 0.02;

        if (this.x < 0 || this.x > window.innerWidth) this.vx *= -1;
        if (this.y < 0 || this.y > window.innerHeight) this.vy *= -1;

        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < GALAXY_CONFIG.mouseRepelRadius) {
            const force = (GALAXY_CONFIG.mouseRepelRadius - dist) / GALAXY_CONFIG.mouseRepelRadius;
            this.x += (dx / dist) * force * GALAXY_CONFIG.mouseRepelForce;
            this.y += (dy / dist) * force * GALAXY_CONFIG.mouseRepelForce;
        }
    }

    draw(ctx, theme) {
        ctx.save();
        ctx.globalAlpha = theme.orbAlpha + Math.sin(this.angle) * 0.1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.stroke();
        ctx.restore();
    }
}

class Star {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 2 + 1;
        this.twinkleOffset = Math.random() * 100;
    }

    draw(ctx, theme) {
        const opacity = theme.starAlpha + Math.sin(Date.now() * 0.003 + this.twinkleOffset) * 0.2;
        ctx.save();
        ctx.globalAlpha = Math.max(0, opacity);
        ctx.fillStyle = theme.starColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alpha = 1;
        this.color = GALAXY_CONFIG.particleColors[Math.floor(Math.random() * GALAXY_CONFIG.particleColors.length)];
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= 0.02;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

window.galaxy = new Galaxy();
