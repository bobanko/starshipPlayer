const Splitter = require('stream-split');
const NALseparator = new Buffer([0, 0, 0, 1]);//NAL break
const getStaticFeedPipe = require('./get-static-feed');

module.exports = class Streaming {

    constructor(source, onData, onClose) {

        let readStream = getStaticFeedPipe(source);

        readStream.on('data', (data) => {
            onData(Buffer.concat([NALseparator, data]), {binary: true});
        });


        readStream.on('finish', function () {
            onClose();
        });

    }

};

