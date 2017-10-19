/* controls playback elements appearance */
export class PlaybackComponent {
    constructor({selector, totalFrameCount = 1}) {
        this._element = document.querySelector(selector);
        this._value = 0;
        this.totalFrameCount = totalFrameCount;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;// Math.max(0, Math.min(value, 100));
        requestAnimationFrame(() => this.update());
    }

    update() {
        let percentage = Math.floor(this._value / this.totalFrameCount * 100);
        this._element.style.width = `${percentage}%`;
    }
}