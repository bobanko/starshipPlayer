import {WsClient} from './ws-client';
import {FrameDecoder} from './frame-decoder';
import {Player} from './player';
import config from './../config';

import './dashboard.less';

let cameras = ['front_camera', 'left_stereo-left', 'right_stereo-left', 'back_camera_left', 'back_camera_right'];

cameras.forEach(cameraName => {
    let playerSelector = `.player.${cameraName}`;


    const player = new Player(playerSelector);

    const frameDecoder = new FrameDecoder();

    frameDecoder.onFrameDecoded.subscribe((frame) => player.addFrame(frame));

    const wsClient = new WsClient({url: `ws://localhost:${config.wsPort}`, fileMask: cameraName});
    wsClient.onFrameCountGot.subscribe(frameCount => player.setTotalFrameCount(frameCount));
    wsClient.onFrameGot.subscribe(frame => frameDecoder.decode(frame));

    //playback support
    ['play', 'pause', 'forward', 'backward', 'rewind'].forEach(command => {
        document.querySelector(`.playback-control-panel .playback-${command}`).addEventListener('click', () => player[command]());
    });


    document.querySelector(`.playback-control-panel .playback-${'speed'}`).addEventListener('change', (event) => {
        let speed = event.target.value;
        player.setPlaybackSpeed(speed);
    });

});