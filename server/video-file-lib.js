const fs = require('fs');

const ffprobe = require('ffprobe');
const ffprobeStatic = require('ffprobe-static');

const Rx = require('Rxjs');


function mapFileInfo(fileInfo, filePath) {
    return {
        filePath: filePath,
        fileSize: fs.statSync(filePath)['size'],
        width: fileInfo.width,
        height: fileInfo.height,
        frameCount: /*fileInfo.nb_frames ||*/ 200, //todo: missing
        duration: /*fileInfo.duration ||*/ 5, //todo: missing
        frameRate: fileInfo.r_frame_rate,
    }
}


function getFileInfoAsync(filePath) {
    return new Promise(function (resolve, reject) {
        ffprobe(filePath, {path: ffprobeStatic.path}, function (err, info) {
            if (err) {
                return reject(err);
            }
            return resolve(mapFileInfo(info.streams[0], filePath));
        });
    });
}


class VideoFileLib {

    constructor({path, extensionMask}) {
        this.files = [];

        this.loadFiles(path, extensionMask);
    }

    getFileStream(fileNameMask = /./) {
        return Rx.Observable.from(this.files.filter(fileName => fileNameMask.test(fileName)));
    }


    loadFiles(path, extensionMask = /./) {

        fs.readdir(path, (err, items) => {

            let promiseArr = items
                .filter(fileName => extensionMask.test(fileName))
                .sort((fileName1, fileName2) => fileName1 - fileName2)
                .map(fileName => path + fileName)
                .map(filePath => getFileInfoAsync(filePath));


            Promise.all(promiseArr)
                .then(files => files.forEach(fileInfo => this.files.push(fileInfo)))
                .then(() => console.log('all video files loaded'));
        })
    }
}


module.exports = VideoFileLib;