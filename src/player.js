import * as Rx from 'rxjs/Rx';

import {PlaybackComponent} from './playback-component';
import * as config from '../config';

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

let playbackSelector = {
    bar: '.playback-bar',
    cache: '.playback-cache',
    progress: '.playback-progress',
    handler: '.playback-handler',
};


export class Player {

    constructor(playerSelector) {

        this.frameList = [];
        this.totalFrameCount = 0;
        //this.frameListSubject = new Rx.Subject();

        // this.frameListSubject
        // //.throttleTime(100)
        //     .zip(Rx.Observable.timer(0, 1000), x => x)
        //     .map(frame => {return frame;})
        //     .subscribe(frame => this.decode(frame));

        this.$playbackCache = new PlaybackComponent({
            selector: `${playerSelector} ${playbackSelector.cache}`,
            //totalFrameCount: this.totalFrameCount
        });
        this.$playbackProgress = new PlaybackComponent({
            selector: `${playerSelector} ${playbackSelector.progress}`,
            //totalFrameCount: this.totalFrameCount
        });


        let $playbackBar = document.querySelector(`${playerSelector} ${playbackSelector.bar}`);
        $playbackBar.addEventListener('click', (event) => {
            let max = $playbackBar.clientWidth;
            let current = event.layerX;

            let percentage = current/max;
            let frameIndex = Math.floor(this.totalFrameCount * percentage);

            this.shiftFrame(frameIndex);
        });



        this.canvas = document.querySelector(`${playerSelector}>canvas`);
        this.canvasCtx = this.canvas.getContext('2d');
        this.canvasBuffer = this.canvasCtx.createImageData(this.canvas.width, this.canvas.height);



        //start playing
        //this.shiftFrame();

        let fpsCounter = document.querySelector('.fps');

        //fps counter
        let lastSampleTime = 0;

        this.frameCount = 0;
        setInterval(() => {
            let now = performance.now();
            if (this.frameCount > 0) {
                let currentFps = (this.frameCount / (now - lastSampleTime) * 1000).toFixed(2);
                fpsCounter.textContent = currentFps;
                this.frameCount = 0;
            }
            lastSampleTime = now;
        }, SEC);


        this.setPlaybackSpeed('normal');
        this.animateSimple();

        this.currentFrameIndex = 0;
        this.isPaused = false;

        this.frameIndex = 0;

        this.framesDrawed = 0;
        this.currentFPS = 0;

        //todo: make fps component
        setInterval(()=>{
            this.currentFPS = this.framesDrawed;
            this.framesDrawed = 0;
        },SEC);
    }

    //PLAYER API

    setPlaybackSpeed(speed = 'normal'){
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

        if(frameIndex !== undefined) {
            this.currentFrameIndex = frameIndex;
        }

        this.$playbackProgress.value =this.currentFrameIndex;

        if (this.isPaused)return;

        //const frame = this.frameList[this.currentFrameIndex].frame;

        const frameObj =this.frameList.find(x=> x.index === this.currentFrameIndex);
        //todo: decode frames before this
        if (frameObj) {
            const frame = frameObj.frame;

            let decodedFrameBuffer = this.decode(frame);

            this.canvasCtx.putImageData(decodedFrameBuffer, 0, 0);

            this.drawText(this.canvasCtx, {
                text: `curr:${this.currentFrameIndex}/cached:${ this.frameList.length}/total:${this.totalFrameCount}`,
                x: 0, y: 120
            });

            this.drawText(this.canvasCtx, {
                text: `FPS:${this.currentFPS}`,
                x: 190, y: 15
            });

            this.currentFrameIndex++;
        }
    }


    drawText(ctx, { text = 'no text', font = 'monospace', size = 14, color = 'black', shadow = 'white', x = 0, y = 0 }){
        ctx.font = `${size}px ${font}`;
        ctx.fillStyle = color;
        //shadow
        ctx.shadowColor = shadow;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.shadowBlur = 0;

        this.canvasCtx.fillText(text, x, y);
    }


    animateSimple(){
        if (!this.isPaused) {
            this.shiftFrame();
            this.framesDrawed++;
        }

        setTimeout(() => {
            this.animateSimple();
        }, this.fpsInterval);

        //todo: use this
        //requestAnimationFrame(() => this.animateSimple());
    }




    animate(now) {
        // request another frame
        requestAnimationFrame((time) => this.animate(time));
        if (this.isPaused)return;

        // calc elapsed time since last loop
        let elapsed = now - this.lastDrawTime;

        // if enough time has elapsed, draw the next frame
        if (elapsed > this.fpsInterval) {
            // Get ready for next frame by setting lastDrawTime=now, but...
            // Also, adjust for fpsInterval not being multiple of 16.67
            this.lastDrawTime = now - (elapsed % this.fpsInterval);

            this.frameCount++;

            //drawNextFrame(now, canvas, ctx, currentFps);
            this.shiftFrame();

        }
    }


    fpsController() {

        let fps = 0; //0 is maxfps speed, 1 is 1

        Rx.Observable.interval(1).throttle(() => Rx.Observable.timer(SEC / fps)).subscribe(x => console.log(x));
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