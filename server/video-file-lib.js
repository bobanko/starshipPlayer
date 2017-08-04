const fs = require('fs');

const ffprobe = require('ffprobe');
const ffprobeStatic = require('ffprobe-static');


class VideoFileLib {

    constructor() {
        this._onFileReadyCallbacks = [];
        this.files = [];
    }



    getFiles(path, fileMask) {
        fs.readdir(path, (err, items) => {

            items.filter(file => fileMask.test(file))
                .map(file => this.getFileInfoAsync(path + file))
                .map(p => p.then(info => this.fileIsReady(info)));
        })
    }


    fileIsReady(fileInfo) {
        this.files.push(fileInfo);
        this._onFileReadyCallbacks.forEach(cb => cb(fileInfo));
    }

    onFileReady(callback) {
        this._onFileReadyCallbacks.push(callback);
    }

    static mapFileInfo(fileInfo, filePath) {
        return {
            filePath: filePath,
            width: fileInfo.width,
            height: fileInfo.height,
            frameCount: /*fileInfo.nb_frames ||*/ 200, //todo: missing
            duration: /*fileInfo.duration ||*/ 5, //todo: missing
            frameRate: fileInfo.r_frame_rate,
        }
    }

    getFileInfoAsync(filePath) {
        return new Promise(function (resolve, reject) {
            ffprobe(filePath, {path: ffprobeStatic.path}, function (err, info) {
                //console.log(filePath);
                if (err) {
                    return reject(err);
                }

                return resolve(VideoFileLib.mapFileInfo(info.streams[0], filePath));
            });
        });
    }

}


module.exports = VideoFileLib;