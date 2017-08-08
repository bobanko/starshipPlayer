const fs = require('fs');
const getObservableFromStream = require('./../lib/rxjs.getObservableFromStream');
const Throttle = require('stream-throttle').Throttle;

const Splitter = require('stream-split');
const NAL_SEPARATOR = new Buffer([0, 0, 0, 1]);//NAL break


module.exports = function getStaticFeedPipe({filePath, fileSize, duration}) {

    const sourceThrottleRate = Math.floor(fileSize / duration);
    const NAL_Splitter = new Splitter(NAL_SEPARATOR);

    let pipe = fs.createReadStream(filePath)
		.pipe(new Throttle({rate: sourceThrottleRate}))
		.pipe(NAL_Splitter);


    return getObservableFromStream(pipe).map(data => Buffer.concat([NAL_SEPARATOR, data]));
};