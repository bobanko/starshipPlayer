import * as Rx from 'rxjs/Rx';
import * as config from '../../config';
import {drawText, FPS} from './fps';


const SEC = 1000;
const defaultFPS = 30;
const defaultFrameSkip = 100;

const speeds = [
    { name: '0.25',		value: defaultFPS * .25 },
    { name: '0.5',		value: defaultFPS * .5 },
    { name: '0.75',		value: defaultFPS * .75 },
    { name: 'normal',	value: defaultFPS },
    { name: '1.25',		value: defaultFPS * 1.25 },
    { name: '1.5',		value: defaultFPS * 1.5 },
    { name: '2',		value: defaultFPS * 2 },
];

const playbackChangeEventName = 'playbackChange';

export class Player {

    constructor(playerSelector, {cacheComponent, progressComponent }) {

        //todo: move framelist to lib
        this.frameList = [];
        this.totalFrameCount = 0;

        this.$playbackCache = cacheComponent;
        this.$playbackProgress = progressComponent;

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
        this.currentFrameIndex = Math.min(this.currentFrameIndex + frames, this.totalFrameCount);
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


    setTotalFrameCount(count) {
        this.$playbackCache.totalFrameCount = this.$playbackProgress.totalFrameCount = this.totalFrameCount = count;
    }


    addFrame(frame) {
        this.frameList.push({frame, timestamp: +new Date(), index: this.frameIndex++});

        this.$playbackCache.value++;
    }


    shiftFrame(frameIndex) {

        if (frameIndex !== undefined) {
            this.currentFrameIndex = frameIndex;
        }

        this.$playbackProgress.value = this.currentFrameIndex;

        if (this.isPaused)return;

        const frameObj = this.frameList.find(x => x.index === this.currentFrameIndex);
        //todo: decode frames before this
        if (frameObj) {
            let decodedFrameBuffer = this.decode(frameObj.frame);

            this.canvasCtx.putImageData(decodedFrameBuffer, 0, 0);

            drawText(this.canvasCtx, {
                text: `curr:${this.currentFrameIndex}/cached:${ this.frameList.length}/total:${this.totalFrameCount}`,
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


    decode(buffer, width = config.videoSize.width, height = config.videoSize.height) {
        if (!buffer)
            return;

        const canvasBuffer = new ImageData(width, height);

        const lumaSize = width * height;
        const chromaSize = lumaSize >> 2;

        const ybuf = buffer.subarray(0, lumaSize);
        const ubuf = buffer.subarray(lumaSize, lumaSize + chromaSize);
        const vbuf = buffer.subarray(lumaSize + chromaSize, lumaSize + 2 * chromaSize);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const yIndex = x + y * width;
                const uIndex = ~~(y / 2) * ~~(width / 2) + ~~(x / 2);
                const vIndex = ~~(y / 2) * ~~(width / 2) + ~~(x / 2);
                const R = 1.164 * (ybuf[yIndex] - 16) + 1.596 * (vbuf[vIndex] - 128);
                const G = 1.164 * (ybuf[yIndex] - 16) - 0.813 * (vbuf[vIndex] - 128) - 0.391 * (ubuf[uIndex] - 128);
                const B = 1.164 * (ybuf[yIndex] - 16) + 2.018 * (ubuf[uIndex] - 128);

                const rgbIndex = yIndex * 4;
                canvasBuffer.data[rgbIndex + 0] = R;
                canvasBuffer.data[rgbIndex + 1] = G;
                canvasBuffer.data[rgbIndex + 2] = B;
                canvasBuffer.data[rgbIndex + 3] = 0xff;
            }
        }

        return canvasBuffer;
    }
}