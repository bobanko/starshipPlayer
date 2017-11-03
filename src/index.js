import {WsClient} from './ws-client';
import {FrameDecoder} from './frame-decoder';
import {Player} from './player/player';
import config from './../config';

import './dashboard.less';
import {PlaybackComponent} from './playback/playback-component';
import {VideoLib} from './video-lib';


//todo: move playback controls singletone here

let playbackSelector = {
    bar: '#playback-main.playback-bar',
    cache: '#playback-main .playback-cache',
    progress: '#playback-main .playback-progress',
    handler: '#playback-main .playback-handler',
};



let playbackBar = document.querySelector(playbackSelector.bar);
playbackBar.addEventListener('click', (event) => {
    let max = playbackBar.clientWidth;
    let current = event.layerX;

    let percentage = current / max;

    players.forEach(player => {
        let frameIndex = Math.floor(player.video.totalFrameCount * percentage);
        player.shiftFrame(frameIndex);
    });

});



const players = [];

let videoNames = ['front_camera', 'left_stereo-left', 'right_stereo-left', 'back_camera_left', 'back_camera_right'];

const wsUrl = `ws://${config.hostName}:${config.wsPort}`;
const videoLib = new VideoLib({wsUrl, videoNames});

videoNames.forEach(videoName => {
	let video = videoLib.getVideo(videoName);
	let playerSelector = `.player.${videoName}`;
	const player = new Player(playerSelector, {video});

    players.push(player);
});


let cacheComponent = new PlaybackComponent({
	selector: `${playbackSelector.cache}`,
	getCurrent: ()=> videoLib.getCachedFrameCount(),
	getMax: ()=> videoLib.getTotalFrameCount(),
});
let progressComponent = new PlaybackComponent({
	selector: `${playbackSelector.progress}`,
	getCurrent: ()=> players[0].currentFrameIndex,
	getMax: ()=> videoLib.getTotalFrameCount(),
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
