import { drawText, FPS } from './fps';
import { decodeFrameBuffer } from './canvasBufferDecoder';
import { PlaybackComponent } from "../playback/playback-component";


const SEC = 1000;
const defaultFPS = 30;
const defaultFrameSkip = 100;

const speeds = [
	{name: '0.25', value: defaultFPS * .25},
	{name: '0.5', value: defaultFPS * .5},
	{name: '0.75', value: defaultFPS * .75},
	{name: 'normal', value: defaultFPS},
	{name: '1.25', value: defaultFPS * 1.25},
	{name: '1.5', value: defaultFPS * 1.5},
	{name: '2', value: defaultFPS * 2},
];


export class Player {

	constructor(playerSelector, {video}) {

		this.video = video;

		this.canvas = document.querySelector(`${playerSelector}>canvas`);
		this.canvasCtx = this.canvas.getContext('2d');
		this.canvasBuffer = this.canvasCtx.createImageData(this.canvas.width, this.canvas.height);

		this.fpsComponent = new FPS(this.canvasCtx, {x: 190, y: 15});

		this.setPlaybackSpeed('normal');
		this.animateSimple();

		this.currentFrameIndex = 0;
		this.isPaused = false;

		this.frameIndex = 0;

	}

	//PLAYER API

	setPlaybackSpeed(speed = 'normal') {
		this.fpsInterval = SEC / speeds.find(x => x.name === speed).value;
	}

	play() {
		this.isPaused = false;
	}

	pause() {
		this.isPaused = true;
	}

	forward(frames = defaultFrameSkip) {
		this.pause();
		this.currentFrameIndex = Math.min(this.currentFrameIndex + frames, this.video.totalFrameCount);
		this.play();
	}

	backward(frames = defaultFrameSkip) {
		this.pause();
		this.currentFrameIndex = Math.max(this.currentFrameIndex - frames, 0);
		this.play();
	}

	rewind() {
		this.pause();
		this.currentFrameIndex = 0;
		this.play();
	}


	addFrame(frame) {
		//todo: remove
	}


	shiftFrame(frameIndex) {

		if (frameIndex !== undefined) {
			this.currentFrameIndex = frameIndex;
		}

		const frameObj = this.video.getFrame(this.currentFrameIndex);
		//todo: decode frames before this?
		if (frameObj) {
			let decodedFrameBuffer = decodeFrameBuffer(frameObj.frame);

			this.canvasCtx.putImageData(decodedFrameBuffer, 0, 0);

			drawText(this.canvasCtx, {
				text: `curr:${this.currentFrameIndex}/cached:${this.video.cachedFrameCount}/total:${this.video.totalFrameCount}`,
				x: 0, y: 120
			});

			this.currentFrameIndex++;
		}
	}

	animateSimple() {
		if (!this.isPaused) {
			this.shiftFrame();
		}

		setTimeout(() => {
			this.animateSimple();
		}, this.fpsInterval);

		this.fpsComponent.draw();
		//todo: use requestAnimationFrame
	}



}
