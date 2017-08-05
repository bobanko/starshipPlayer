const fs = require('fs');
const Throttle = require('stream-throttle').Throttle;


class StaticFeed {

    constructor(options) {
        this.options = options;
    }

    get_feed() {
        const source = this.options.filePath;

        //throttle for "real time simulation"
        const sourceThrottleRate = Math.floor(fs.statSync(source)['size'] / this.options.duration);
        console.log("Generate a throttle rate of %s kBps", Math.floor(sourceThrottleRate / 1024));

        let readStream = fs.createReadStream(source);
        readStream = readStream.pipe(new Throttle({rate: sourceThrottleRate}));

        console.log("Generate a static feed from ", source);
        return readStream;
    }



}


module.exports = StaticFeed;
