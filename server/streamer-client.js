const Rx = require('rxjs/Rx');

const getStaticFeedPipe = require('./get-static-feed');

module.exports = class StreamerClient {
    constructor() {
        this.onFrameReceived = new Rx.Subject();
    }

    startSubStream(fileInfo) {
        return Rx.Observable.create((observer) => {

            getStaticFeedPipe(fileInfo).subscribe(
                data => this.onFrameReceived.next(data),
                () => observer.error(),
                () => observer.complete());

            return function () {
                // Any cleanup logic might go here
            }
        });
    }

    startStreamSequence(fileInfoObservable) {
        //when substream completes - start new one
        fileInfoObservable.concatMap(fileInfo => this.startSubStream(fileInfo))
            .subscribe(() => console.log('⏹ stream ended'));//just to start
    }


    dispose() {
        this.onFrameReceived.complete();
        delete this;//?
        //todo: dispose all shit
    }


};