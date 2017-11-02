import {WsClient} from './ws-client';
import {FrameDecoder} from './frame-decoder';
import {Player} from './player/player';
import config from './../config';

import './dashboard.less';
import {PlaybackComponent} from "./playback/playback-component";
import {VideoLib} from "./video-lib";


//todo: move playback controls singletone here

let playbackSelector = {
    bar: '#playback-main.playback-bar',
    cache: '#playback-main .playback-cache',
    progress: '#playback-main .playback-progress',
    handler: '#playback-main .playback-handler',
};

let cacheComponent = new PlaybackComponent({
    selector: `${playbackSelector.cache}`,
    //totalFrameCount: this.totalFrameCount
});
let progressComponent = new PlaybackComponent({
    selector: `${playbackSelector.progress}`,
    //totalFrameCount: this.totalFrameCount
});

let playbackBar = document.querySelector(playbackSelector.bar);
playbackBar.addEventListener('click', (event) => {
    let max = playbackBar.clientWidth;
    let current = event.layerX;

    let percentage = current / max;

    players.forEach(player => {
        let frameIndex = Math.floor(player.totalFrameCount * percentage);
        player.shiftFrame(frameIndex);
    });

});


const players = [];

let cameras = ['front_camera', 'left_stereo-left', 'right_stereo-left', 'back_camera_left', 'back_camera_right'];

const wsUrl = `ws://${config.hostName}:${config.wsPort}`;
const videoLib = new VideoLib({wsUrl});

cameras.forEach(cameraName => {
    let playerSelector = `.player.${cameraName}`;
    const player = new Player(playerSelector, {cacheComponent, progressComponent, playbackBar});
    players.push(player);

    let libLoad = videoLib.loadVideo(cameraName);

    //todo: move framelist to lib
    libLoad.onFrameGot((frame) => player.addFrame(frame));
    libLoad.onTotalGot(frameCount => player.setTotalFrameCount(frameCount));

});


document.querySelector(`.playback-control-panel .playback-${'speed'}`).addEventListener('change', (event) => {
    let speed = event.target.value;
    players.forEach(player => player.setPlaybackSpeed(speed));
});

['play', 'pause', 'forward', 'backward', 'rewind'].forEach(command => {
    document.querySelector(`.playback-control-panel .playback-${command}`).addEventListener('click', () => {
        players.forEach(player => player[command]());
    });
});
