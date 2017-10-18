const WebSocket = require('ws');
const Rx = require('rxjs/Rx');

const VideoFileLib = require('./video-file-lib');
const StreamerClient = require('./streamer-client');


module.exports = function wsServer(config) {
    let fileLib = new VideoFileLib({path: config.videosDir, videoExtensionMask: /(.+).h264$/});

    console.log('ws server constructed');

    const wss = new WebSocket.Server(config);

    wss.on('connection', (ws) => {
        console.log('client connected');

        let client = new StreamerClient();

        client.onFrameReceived.subscribe((data) => ws.send(data));

        let wsSend = new Rx.Subject();
        wsSend.subscribe(message => ws.send(message));


        ws.on('message', function (message) {
            console.log('received from client: %s', message);
            let fileNameRegex = new RegExp(message, 'i');
            client.startStreamSequence(fileLib.getFileInfoObservable(fileNameRegex));

            let frameCountMessage = JSON.stringify({frameCount: fileLib.getFileInfosTotalFrames(fileNameRegex)});
            wsSend.next(frameCountMessage);
        });

        ws.on('close', () => client.dispose());

    });


    console.log(`WS running on http://localhost:${ config.port }`);
};

