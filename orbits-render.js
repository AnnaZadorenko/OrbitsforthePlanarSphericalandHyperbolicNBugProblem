
export class OrbitsRenderer {

    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.geometry = 'planar';
        this.n = 3;
        this.speed = 1;

        this.showBugs = true;
        this.showPath = true;
        this.playing = false;

        this.resize();
    }

    hasAnimation() {
        return false;
    }

    setGeometry(value) {
        this.geometry = value;
        this.reset();
    }

    setBugCount(value) {
        this.n = Number(value);
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
        this.playing = false;
    }

    pause() {
        this.playing = false;
    }

    reset() {
        this.pause();
        this.draw();
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        this.canvas.width = Math.max(1, Math.round(rect.width * dpr));
        this.canvas.height = Math.max(1, Math.round(rect.height * dpr));

        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.draw();
    }

    draw() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;

        this.ctx.clearRect(0, 0, w, h);
    }
}
