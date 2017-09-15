import Rx from 'rxjs/Rx';

export class WsClient {

    constructor({url, fileMask}) {
        this.socket = new WebSocket(url);
        this.socket.binaryType = 'arraybuffer';

        //subscriptions
        this.socket.addEventListener('open', (event) => console.log('🌐ws connected'));
        this.socket.addEventListener('close', (event) => console.log(`🌐ws closed ${event.wasClean ? 'ok 🖤' : 'bad 💔'} code: ${event.code }, reason: ${event.reason }`));
        this.socket.addEventListener('error', (event) => console.log(`🌐ws error ${event.message}`));
        this.socket.addEventListener('message', (event) => this.onMessage(event));

        this.socket.addEventListener('open', () => {
            //todo: add client/server playback commands to use

            //todo: spread commands to all videos/clients simultaneously
            //send which files to stream
            this.socket.send(fileMask);
        });

        this.totalFrameCount = null;
        this._onFrame = new Rx.Subject();
        this._onFrameCount = new Rx.Subject();
        this.onFrameGot = this._onFrame.asObservable();
        this.onFrameCountGot = this._onFrameCount.asObservable();
    }


    onMessage(event) {
        if (typeof event.data === 'string') {
            console.log(`🌐ws data received: ${event.data}`);

            try {
                let messageObj = JSON.parse(event.data);

                let frameCount = messageObj['frameCount'];
                if (frameCount !== undefined) {
                    this._onFrameCount.next(frameCount);
                    this._onFrameCount.complete();
                }
            }catch (err){
                console.warn(err);
            }

            return;
        }

        if (event.data instanceof ArrayBuffer) {
            //binary
            let encodedFrame = new Uint8Array(event.data);
            this._onFrame.next(encodedFrame);
        }

    }

}