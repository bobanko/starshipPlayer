/* controls playback elements appearance */
export class PlaybackComponent {
    constructor(selector) {
        this._element = document.querySelector(selector);
        this._value = 0;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;// Math.max(0, Math.min(value, 100));
        requestAnimationFrame(() => this.update());
    }

    update() {
        const totalFrameCount = 10600;//todo: calc this value on server
        let percentage = Math.floor(this._value / totalFrameCount * 100);
        this._element.style.width = `${percentage}%`;
    }
}