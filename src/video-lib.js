/* Video library loads, decodes and stores videos from server */

import {FrameDecoder} from './frame-decoder';
import {WsClient} from './ws-client';
export class VideoLib {
    constructor({wsUrl}) {
        this.wsUrl = wsUrl;
    }


    load() {

    }

    loadVideo(videoName) {
        const frameDecoder = new FrameDecoder();

        const wsClient = new WsClient({url: this.wsUrl, fileMask: videoName});

        wsClient.onFrameGot.subscribe(frame => frameDecoder.decode(frame));

        return {
            onFrameGot: (callback) => frameDecoder.onFrameDecoded.subscribe(callback),
            onTotalGot: (callback) => wsClient.onFrameCountGot.subscribe(callback),
        }
    }

    getVideoFrame(frameIndex) {

    }

    getTotal() {
        //min?
    }

    getCached() {
        //min
    }


}
