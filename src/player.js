//import { Observable } from 'rxjs';
import * as Rx from 'rxjs';

export class Player {

    constructor(canvas) {

        this.frameList = [];

        this.canvas = canvas;
        this.canvasCtx = this.canvas.getContext("2d");
        this.canvasBuffer = this.canvasCtx.createImageData(this.canvas.width, this.canvas.height);

        //start playing
        this.shiftFrame();
    }

    addFrame(frame) {
        this.frameList.push(frame);
    }

    shiftFrame() {
        const frame = this.frameList.shift();

        if (frame)
            this.decode(frame);

        //requestAnimationFrame(() => this.shiftFrame());
        setTimeout(() => this.shiftFrame(),1000/24);
    }


    fpsController() {

        let fps = 0; //0 is maxfps speed, 1 is 1

        Rx.Observable.interval(1).throttle(() => Rx.Observable.timer(1000 / fps)).subscribe(x => console.log(x));
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