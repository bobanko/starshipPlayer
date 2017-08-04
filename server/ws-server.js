const WebSocket = require('ws');
const Streaming = require('./streaming');


const VideoFileLib = require('./video-file-lib');

const NALseparator = new Buffer([0, 0, 0, 1]);//NAL break


module.exports = class WsServer {

    constructor(config, callback) {
        console.log('ws server constructed');


        const wss = new WebSocket.Server(config);

        wss.on('connection', (ws) => {
            ws.on('message', function incoming(message) {
                console.log('received: %s', message);
            });

            ws.send('stream started');

            //todo: get file list

            let fileLib = new VideoFileLib();
            let isStarted = false;
            fileLib.onFileReady(file => {
                if (!isStarted) {
                    startStream(fileLib.files.shift());
                    isStarted = true;
                }
            });
            fileLib.getFiles('./videos/', /.h264$/);


            function startStream(file) {

                //todo: get file + info
                // let file = {
                //     width: 240,//px
                //     height: 134,//px
                //
                //     filePath: 'videos/6D39_back_camera_left_1496764006.79_20170606_154646.h264',
                //     duration: 5, //in seconds, should be multiplied to fps
                // };

                //todo: start stream file
                console.log('start stream', file);
                new Streaming(file, data => ws.send(data), () => {
                    //todo: when done - get next file
                    console.log('stream ended');
                    if (fileLib.files.length > 0) {
                        setTimeout(() => startStream(fileLib.files.shift()), 0);
                    }
                });

            }


        });


        console.log(`WS running on http://localhost:${ config.port }`);

    }

    send(data) {
        console.log('ws server send');
        this._send(data);
    }
}
;

