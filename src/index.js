import {WsClient} from './ws-client';
import {FrameDecoder} from './frame-decoder';
import {Player} from './player';

const frameDecoder = new FrameDecoder(frameDecoder_onPictureDecoded);
const player = new Player(document.querySelector('canvas'), 240, 144);

const wsClient1 = new WsClient('ws://localhost:9090/front', wsClientOnFrameGot);


function wsClientOnFrameGot(...args) {
    frameDecoder.decode(...args);
}

function frameDecoder_onPictureDecoded(frame) {
    player.addFrame(frame);
}

