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

        ws.isAlive = true;
        ws.on('pong', () => ws.isAlive = true);

        let client = new StreamerClient();

        client.onFrameReceived.subscribe((data) =>{
            ws.send(data, (error)=>{
                if(error) {
                    console.log(`ws send fail`, error);
                }
            });
        });

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


    setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) {
                console.log('ws client terminated');
                return ws.terminate();
            }

            ws.isAlive = false;
            ws.ping('', false, true);
        });
    }, 30000);


    console.log(`WS running on http://localhost:${ config.port }`);
};

