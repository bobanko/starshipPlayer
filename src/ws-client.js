import Rx from 'rxjs/Rx';

export class WsClient {

    constructor({url, fileMask}) {
        this.socket = new WebSocket(url);
        this.socket.binaryType = 'arraybuffer';

        //subscriptions
        this.socket.addEventListener('open', (event) => console.log('🌐ws connected'));
        this.socket.addEventListener('close', (event) => console.log(`🌐ws closed ${event.wasClean ? 'ok 🖤' : 'bad 💔'} code: ${event.code }, reason: ${event.reason }`));
        this.socket.addEventListener('error', (event) => console.log(`🌐ws error ${event.message}`));

        //todo: make rx subs
        this._onFrame = new Rx.Subject();

        this.socket.addEventListener('message', (event) => this.onMessage(event));


        this.socket.addEventListener('open', () => {
            //todo: send which files to stream
            this.socket.send(fileMask);
        });

        this.onFrameGot = this._onFrame.asObservable();


    }


    onMessage(event) {
        if (typeof event.data === 'string') {
            console.log(`🌐ws data received: ${event.data}`);
            return;
        }

        if (event.data instanceof ArrayBuffer) {
            //binary
            let encodedFrame = new Uint8Array(event.data);
            this._onFrame.next(encodedFrame);
        }

    }

}