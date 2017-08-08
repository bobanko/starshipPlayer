const Rx = require('rxjs');

const getStaticFeedPipe = require('./get-static-feed');

module.exports = class StreamerClient {

    constructor(wsSend) {
        this.wsSend = wsSend;
    }


    startSubStream(fileInfo) {
        // return Rx.Observable.create(function (observer) {
        //     observer.next('Hello');
        //     observer.next('World');
        //
        //     observer.complete('');
        // });

        return new Promise((resolve, reject) => {

            getStaticFeedPipe(fileInfo).subscribe(data => this.wsSend(data), reject, resolve);

        });
    }

    startStreamSequence(stream) {

        stream.concatMap(fileInfo => Rx.Observable.fromPromise(this.startSubStream(fileInfo)))
            .subscribe(() => console.log('⏹ stream ended'));//just to start
    }


    dispose() {
        //todo: dispose all shit
    }


};