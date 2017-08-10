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

module.exports = function wsServer(config) {
    let fileLib = new VideoFileLib({path: './videos/', extensionMask: /.h264$/});

    console.log('ws server constructed');

    const wss = new WebSocket.Server(config);

    wss.on('connection', (ws) => {
        console.log('client connected');

        let client = new StreamerClient();

        client.startStreamSequence(fileLib.getFileInfoObservable(CAMERA.FRONT));

        client.onFrameReceived.subscribe((data) => ws.send(data));

        let wsSend = new Rx.Subject();
        wsSend.subscribe(message => ws.send(message));


        ws.on('message', function (message) {
            console.log('received from client: %s', message);
        });

        ws.on('close', () => client.dispose());

    });


    console.log(`WS running on http://localhost:${ config.port }`);
};

