export class WsClient {

    constructor(url, onFrameGot) {
        this.socket = new WebSocket(url);
        this.socket.binaryType = 'arraybuffer';

        //subscriptions
        this.socket.onopen = (event) => this.onOpen(event);
        this.socket.onclose = (event) => this.onClose(event);
        this.socket.onmessage = (event) => this.onMessage(event);
        this.socket.onerror = (event) => this.onError(event);

        //todo: make rx subs
        this.onFrameGot = (frame) => onFrameGot(frame);
    }


    //todo: hide all these methods to private
    onClose(event) {
        console.log(`🌐ws closed ${event.wasClean ? 'ok 🖤' : 'bad 💔'} code: ${event.code }, reason: ${event.reason }`);
    }


    onMessage(event) {
        if (typeof event.data === "string") {
            console.log("Получены данные " + event.data);
            return;
        }
        //binary
        let encodedFrame = new Uint8Array(event.data);

        this.onFrameGot(encodedFrame);
    }


    onOpen() {
        console.log("Соединение установлено.");
    }

    onError(error) {
        console.log("Ошибка " + error.message);
    }

}