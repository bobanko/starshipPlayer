const fs = require('fs');

const ffprobe = require('ffprobe');
const ffprobeStatic = require('ffprobe-static');

const Rx = require('rxjs/Rx');


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

const defaultFileNameMask = /./;

module.exports = class VideoFileLib {

    constructor({path, extensionMask}) {
        this.fileInfos = [];

        this.loadFiles(path, extensionMask);
    }


    getFileInfoObservable(fileNameMask = defaultFileNameMask) {
        return Rx.Observable.from(this.getFileInfosByMask(fileNameMask));
    }

    getFileInfosByMask(fileNameMask = defaultFileNameMask) {
        return this.fileInfos.filter(fileInfo => fileNameMask.test(fileInfo.filePath));
    }

    getFileInfosTotalFrames(fileNameMask = defaultFileNameMask) {
        let fileInfos = this.getFileInfosByMask(fileNameMask);

        return fileInfos.reduce((total, fi) => {
            return total + fi.frameCount;
        }, 0);
    }

    loadFiles(path, extensionMask = /./) {
        console.log('📹 loading video files...');

        fs.readdir(path, (err, items) => {

            let promiseArr = items
                .filter(fileName => extensionMask.test(fileName))
                .sort((fileName1, fileName2) => fileName1 - fileName2)
                .map(fileName => path + fileName)
                .map(filePath => getFileInfoAsync(filePath));


            Promise.all(promiseArr)
                .then(files => files.forEach(fileInfo => this.fileInfos.push(fileInfo)))
                .then(() => console.log('📹 all videos loaded'));
        })
    }
};
