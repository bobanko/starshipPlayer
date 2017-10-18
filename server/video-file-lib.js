const fs = require('fs');

const ffprobe = require('ffprobe');
const ffprobeStatic = require('ffprobe-static');

const Rx = require('rxjs/Rx');


//todo: make async
function readMetaFile(metaFilePath){
    let metaData = fs.readFileSync(metaFilePath);
    let metaArr = metaData.toString().split('\n');
    return metaArr;
}

function mapFileInfo(fileInfo, filePair) {

    let meta = readMetaFile(filePair.meta);
    const frameRate = 40; //to get duration === 5
    return {
        meta,
        filePath: filePair.video,
        //todo: make async
        fileSize: fs.statSync(filePair.video)['size'],
        width: fileInfo.width,
        height: fileInfo.height,
        frameCount: meta.length,
        duration: meta.length / frameRate,
        frameRate: fileInfo.r_frame_rate,
    }
}

function getFileInfoAsync(filePair) {
    return new Promise((resolve, reject) => {

        ffprobe(filePair.video, {path: ffprobeStatic.path}, (err, info) => {
            if (err) return reject(err);

            resolve(mapFileInfo(info.streams[0], filePair));
        });

    });
}

function getDirFilesAsync(dirPath){
    return new Promise((resolve, reject) => {
        fs.readdir(dirPath, (err, items) => {
            if(err) return reject(err);

            let fileInfosPromiseArr = items
                .sort((fileName1, fileName2) => fileName1 - fileName2)
                .map(fileName => dirPath + fileName);

            Promise.all(fileInfosPromiseArr).then((fileNames) => resolve(fileNames));
        });
    });
}


const defaultFileNameMask = /./;

module.exports = class VideoFileLib {

    constructor({path, videoExtensionMask}) {
        this.fileInfos = [];


        this.loadFiles(path, videoExtensionMask);
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





    async loadFiles(path, videoExtensionMask = /./) {
        console.log('📹 loading video files...');

        let dirFiles = await getDirFilesAsync(path);

        //todo: could be lag here, due to sync chain: loadfiles -> getfileinfos

        function getMetaFileName(videoFileName){
            return videoFileName.replace(videoExtensionMask, '$1.meta')
        }


        let fileInfosPromiseArr = dirFiles
            .filter(fileName => videoExtensionMask.test(fileName))
            .map(filePath => ({ video: filePath, meta: getMetaFileName(filePath) }))
            .map(filePair => getFileInfoAsync(filePair));

        let fileInfos = await Promise.all(fileInfosPromiseArr);

        this.fileInfos.push(...fileInfos);

        console.log('📹 all videos loaded');
    }
};
