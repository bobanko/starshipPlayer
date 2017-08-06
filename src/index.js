import {WsClient} from './ws-client';
import {FrameDecoder} from './frame-decoder';
import {Player} from './player';


let cameras = ['front_camera'/*, 'left_stereo-left', 'right_stereo-left', 'back_camera_left', 'back_camera_right'*/];


cameras.forEach(cameraName => {
    const player = new Player(document.querySelector(`canvas.${cameraName}`), 240, 144);
    const wsClient = new WsClient('ws://localhost:9091', wsClientOnFrameGot);
    const frameDecoder = new FrameDecoder(frameDecoder_onPictureDecoded);

    function wsClientOnFrameGot(...args) {
        frameDecoder.decode(...args);
    }

    function frameDecoder_onPictureDecoded(frame) {
        player.addFrame(frame);
    }
});