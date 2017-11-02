/* FPS component */
const SEC = 1000;

export class FPS{
    constructor(canvasCtx, position){
        this.canvasCtx = canvasCtx;
        this.position = position;

        this.framesDrawed = 0;
        this.currentFPS = 0;
        //todo: timer
        setInterval(() => {
            this.currentFPS = this.framesDrawed;
            this.framesDrawed = 0;
        }, SEC);
    }

    draw(){
        this.framesDrawed++;
        drawText(this.canvasCtx, {
            text: `FPS:${this.currentFPS}`,
            x: this.position.x, y: this.position.y
        });
    }
}

export function drawText(ctx, {text = 'no text', font = 'monospace', size = 14, color = 'black', shadow = 'white', x = 0, y = 0}) {
    ctx.font = `${size}px ${font}`;
    ctx.fillStyle = color;
    //shadow
    ctx.shadowColor = shadow;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.shadowBlur = 0;

    ctx.fillText(text, x, y);
}
