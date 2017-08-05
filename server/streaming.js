const Splitter = require('stream-split');
const NALseparator = new Buffer([0, 0, 0, 1]);//NAL break
const RemoteTCPFeedRelay = require('./static-feed');

module.exports = class Streaming {

    constructor(source, onData, onClose) {

        let feedRelay = new RemoteTCPFeedRelay(source);

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

