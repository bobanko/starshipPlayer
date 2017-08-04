const Splitter = require('stream-split');
const NALseparator = new Buffer([0, 0, 0, 1]);//NAL break
const RemoteTCPFeedRelay = require('./staticFeed');

module.exports = class Streaming {

    constructor(source, onData, onClose) {

        this.callbacks = [];

        let server = null;

        let feedRelay = new RemoteTCPFeedRelay(server, source);

        let readStream = feedRelay.get_feed();

        readStream = readStream.pipe(new Splitter(NALseparator));
        readStream.on('data', (data) => {
            onData(Buffer.concat([NALseparator, data]), {binary: true});
        });


        readStream.on('finish', function () {
            onClose();
        });

    }

};

