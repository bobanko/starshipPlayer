const Rx = require('rxjs');

// from https://stackoverflow.com/a/42174935/662368
module.exports = function getObservableFromStream(stream, finishEventName = 'end', dataEventName = 'data') {
    stream.pause();

    return new Rx.Observable((observer) => {
        function dataHandler(data) {
            observer.next(data);
        }

        function errorHandler(err) {
            observer.error(err);
        }

        function endHandler() {
            observer.complete();
        }

        stream.addListener(dataEventName, dataHandler);
        stream.addListener('error', errorHandler);
        stream.addListener(finishEventName, endHandler);

        stream.resume();

        return () => {
            stream.removeListener(dataEventName, dataHandler);
            stream.removeListener('error', errorHandler);
            stream.removeListener(finishEventName, endHandler);
        };
    }).publish().refCount();
}