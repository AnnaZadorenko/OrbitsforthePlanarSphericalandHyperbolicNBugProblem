
import { generateOrbits } from './orbits-math.js';

export class OrbitsRenderer {

    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.geometry = 'planar';
        this.n = 3;
        this.speed = 1;
        this.orbitColor = '#a6192e';

        this.showBugs = true;
        this.showPath = true;
        this.playing = false;

        this.progress = 0;
        this.lastTime = null;
        this.frame = null;

        this.onComplete = null;

        this.rebuild();
        this.resize();
    }

    hasAnimation() {
        return true;
    }

    setColor(color) {
        this.orbitColor = color;
        this.draw();
    }

    rebuild() {
        this.orbits = generateOrbits(this.geometry, this.n);
        this.total = this.orbits.paths[0]?.length || 0;
    }

    setGeometry(value) {
        this.geometry = value;
        this.rebuild();
        this.reset();
    }

    setBugCount(value) {
        this.n = Number(value);
        this.rebuild();
        this.reset();
    }

    setSpeed(value) {
        this.speed = Number(value);
    }

    setOptions(options) {
        if (options.showBugs !== undefined) {
            this.showBugs = options.showBugs;
        }

        if (options.showPath !== undefined) {
            this.showPath = options.showPath;
        }

        this.draw();
    }

    play() {
        if (this.playing || this.total === 0) return;

        if (this.progress >= this.total - 1) {
            this.progress = 0;
            this.draw();
        }

        this.playing = true;
        this.lastTime = null;

        this.frame = requestAnimationFrame(
            time => this.tick(time)
        );
    }

    tick(time) {
        if (!this.playing) return;

        if (this.lastTime !== null) {
            const delta = Math.min(
                (time - this.lastTime) / 1000,
                0.1
            );

            this.progress += delta * this.speed * 100;
        }

        this.lastTime = time;

        if (this.progress >= this.total - 1) {
            this.progress = this.total - 1;

            this.pause();
            this.draw();

            if (typeof this.onComplete === 'function') {
                this.onComplete();
            }

            return;
        }

        this.draw();

        if (this.playing) {
            this.frame = requestAnimationFrame(
                t => this.tick(t)
            );
        }
    }

    pause() {
        this.playing = false;

        if (this.frame !== null) {
            cancelAnimationFrame(this.frame);
        }

        this.frame = null;
        this.lastTime = null;
    }

    reset() {
        this.pause();
        this.progress = 0;
        this.draw();
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        this.canvas.width = Math.max(
            1,
            Math.round(rect.width * dpr)
        );

        this.canvas.height = Math.max(
            1,
            Math.round(rect.height * dpr)
        );

        this.ctx.setTransform(
            dpr, 0, 0, dpr, 0, 0
        );

        this.draw();
    }

    draw() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;

        if (!w || !h || !this.orbits) return;

        const ctx = this.ctx;

        ctx.clearRect(0, 0, w, h);

        const { paths, boundaryRadius } = this.orbits;

        let maxRadius = boundaryRadius || 0;

        for (const path of paths) {
            for (const p of path) {
                maxRadius = Math.max(
                    maxRadius,
                    Math.hypot(p.x, p.y)
                );
            }
        }

        // Base scaling
        const scale =
            Math.min(w, h) * 0.43 / (maxRadius || 1);

        // Separate size for each geometry
        const geometryScales = {
            planar: 1.0,
            spherical: 1.0,
            hyperbolic: 1.6
        };

        const orbitScale =
            geometryScales[this.geometry] ?? 1.0;

        const toScreen = p => ({
            x: w / 2 + p.x * scale * orbitScale,
            y: h / 2 - p.y * scale * orbitScale
        });



        if (this.total === 0) return;

        const end = Math.max(
            0,
            Math.min(
                this.total - 1,
                Math.floor(this.progress)
            )
        );

        // Detect final frame
        const isFinished =
            this.progress >= this.total - 1;

        // Draw pursuit paths throughout the animation
        // AND keep them visible at the end.
        if (this.showPath) {
            ctx.strokeStyle = this.orbitColor;
            ctx.lineWidth = 1.6;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';

            for (const path of paths) {
                if (!path.length) continue;

                ctx.beginPath();

                const start = toScreen(path[0]);

                ctx.moveTo(start.x, start.y);

                const pathEnd = Math.min(
                    end,
                    path.length - 1
                );

                for (let i = 1; i <= pathEnd; i++) {
                    const p = toScreen(path[i]);

                    ctx.lineTo(p.x, p.y);
                }

                ctx.stroke();
            }
        }

        // Draw bug circles while animation is in progress.
        // Hide circles only at the final frame.
        if (this.showBugs && !isFinished) {
            ctx.fillStyle = this.orbitColor;

            for (const path of paths) {
                if (!path.length) continue;

                const bugIndex = Math.min(
                    end,
                    path.length - 1
                );

                const p = toScreen(path[bugIndex]);

                ctx.beginPath();

                ctx.arc(
                    p.x,
                    p.y,
                    5,
                    0,
                    Math.PI * 2
                );

                ctx.fill();
            }
        }
    }
}
