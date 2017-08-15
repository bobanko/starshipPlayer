//import { Observable } from 'rxjs';
import * as Rx from 'rxjs/Rx';

const SEC = 1000;

export class Player {

    constructor(canvas) {

        this.frameList = [];

        this.frameListSubject = new Rx.Subject();

        // this.frameListSubject
        // //.throttleTime(100)
        //     .zip(Rx.Observable.timer(0, 1000), x => x)
        //     .map(frame => {return frame;})
        //     .subscribe(frame => this.decode(frame));

        this.canvas = canvas;
        this.canvasCtx = this.canvas.getContext("2d");
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


        this.fpsInterval = SEC / 60;
        this.lastDrawTime = performance.now();
        //this.animate();

        setInterval(() => this.shiftFrame(), SEC / 10);


        window.shiftFrame = () => this.shiftFrame();
    }

    addFrame(frame) {
        this.frameList.push(frame);

        this.frameListSubject.next(frame);

    }


    shiftFrame() {
        const frame = this.frameList.shift();

        //todo: decode frames zaranee
        if (frame)
            this.decode(frame);

        //requestAnimationFrame(() => this.shiftFrame());
        //setTimeout(() => this.shiftFrame(),1000/24);
    }

    animate(now) {
        // request another frame
        requestAnimationFrame((time) => this.animate(time));

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


    decode(buffer, width = 240, height = 144) {
        if (!buffer)
            return;

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
                this.canvasBuffer.data[rgbIndex + 0] = R;
                this.canvasBuffer.data[rgbIndex + 1] = G;
                this.canvasBuffer.data[rgbIndex + 2] = B;
                this.canvasBuffer.data[rgbIndex + 3] = 0xff;
            }
        }

        this.canvasCtx.putImageData(this.canvasBuffer, 0, 0);
    }
}