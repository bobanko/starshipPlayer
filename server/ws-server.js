const WebSocket = require('ws');
const Rx = require('Rxjs');

const VideoFileLib = require('./video-file-lib');
const StreamerClient = require('./streamer-client');


const CAMERA = {
    FRONT: /front_camera/,
    STEREO_LEFT: /left_stereo-left/,
    STEREO_RIGHT: /right_stereo-left/,
    BACK_LEFT: /back_camera_left/,
    BACK_RIGHT: /back_camera_right/,
};

module.exports = class WsServer {


    constructor(config, callback) {
        let fileLib = new VideoFileLib({path: './videos/', extensionMask: /.h264$/});

        console.log('ws server constructed');

        const wss = new WebSocket.Server(config);

        wss.on('connection', (ws) => {
            console.log('client connected');




            let client = new StreamerClient((data)=>ws.send(data));
            //client.connectStream();

            client.startStreamSequence(fileLib.getFileStream(CAMERA.FRONT));

            let wsSend = new Rx.Subject();
            wsSend.subscribe(message => ws.send(message));



            ws.on('message', function (message) {
                console.log('received from client: %s', message);
                client.message
            });

            ws.on('close', () => client.dispose());

        });


        console.log(`WS running on http://localhost:${ config.port }`);

    }
};

