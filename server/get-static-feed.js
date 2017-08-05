const fs = require('fs');
const Throttle = require('stream-throttle').Throttle;

const Splitter = require('stream-split');
const NAL_SEPARATOR = new Buffer([0, 0, 0, 1]);//NAL break


module.exports = function getStaticFeedPipe({filePath, duration}) {

    //throttle for "real time simulation"
    const sourceThrottleRate = Math.floor(fs.statSync(filePath)['size'] / duration);

    console.log('Generate a throttle rate of %s kBps', Math.floor(sourceThrottleRate / 1024));

    let readStream = fs.createReadStream(filePath);
    readStream = readStream.pipe(new Throttle({rate: sourceThrottleRate}));

    console.log('Generate a static feed from ', filePath);
    const NAL_Splitter = new Splitter(NAL_SEPARATOR);
    return readStream.pipe(NAL_Splitter);
};