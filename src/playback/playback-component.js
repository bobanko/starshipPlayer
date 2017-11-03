/* controls playback elements appearance */
export class PlaybackComponent {
    constructor({selector, getCurrent, getMax}) {
        this._element = document.querySelector(selector);
        this.getValue = getCurrent;
        this.getMaxValue = getMax;

	    this.update();
    }

    update() {
        let percentage = Math.floor(this.getValue() / this.getMaxValue() * 100);
        this._element.style.width = `${percentage}%`;
	    requestAnimationFrame(() => this.update());
    }

    render(){
        //todo: impl markup
    }
}
