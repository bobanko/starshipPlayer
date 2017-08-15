import {WsClient} from './ws-client';
import {FrameDecoder} from './frame-decoder';
import {Player} from './player';
import config from './../config';

import './dashboard.less';


let cameras = ['front_camera', 'left_stereo-left', 'right_stereo-left', 'back_camera_left', 'back_camera_right'];



cameras.forEach(cameraName => {
    const player = new Player(document.querySelector(`canvas.${cameraName}`), 240, 144);

    const frameDecoder = new FrameDecoder();
    frameDecoder.onFrameDecoded.subscribe((frame) => player.addFrame(frame));

    const wsClient = new WsClient({url: `ws://localhost:${config.wsPort}`, fileMask: cameraName});

    wsClient.onFrameGot.subscribe(frame => frameDecoder.decode(frame));

});