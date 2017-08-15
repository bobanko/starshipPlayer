import Rx from 'rxjs/Rx';

export class WsClient {

    constructor(url, onFrameGot) {
        this.socket = new WebSocket(url);
        this.socket.binaryType = 'arraybuffer';

        //subscriptions
        this.socket.onopen = (event) => console.log('🌐ws connected');
        this.socket.onclose = (event) => console.log(`🌐ws closed ${event.wasClean ? 'ok 🖤' : 'bad 💔'} code: ${event.code }, reason: ${event.reason }`);
        this.socket.onerror = (event) => console.log(`🌐ws error ${event.message}`);

        //todo: make rx subs
        this._onFrame = new Rx.Subject();

        this.socket.onmessage = (event) => this.onMessage(event);
        this.onFrameGot = (frame) => onFrameGot(frame);
    }


    //todo: hide all these methods to private
    onClose(event) {

    }


    onMessage(event) {
        if (typeof event.data === "string") {
            console.log(`🌐ws data received: ${event.data}`);
            return;
        }
        //binary
        let encodedFrame = new Uint8Array(event.data);

        this.onFrameGot(encodedFrame);
    }

}