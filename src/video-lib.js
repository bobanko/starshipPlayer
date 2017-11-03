/* Video library loads, decodes and stores videos from server */


/*
- `.play()` – start playback
- `.pause()` – pause playback

- `.startPreload()` - start ws preload frames (? with options)
	- `.stopPreload()` - stop ws preloading frames

- `.setFrameRate(fps:number)` - set FPS (?)
- `.setCurrentFrame(frameIndex:number)` - set frame (?)

- `.rewind()` – stop playback and go to the beginning (?)
- `.destroy()` – stop playback, disconnect ws, cleanup cached frames
- `.currentTime` – get/set the current playback position in seconds (?)
*/

class VideoFrame {
	constructor({frame, timestamp, index}){
		this.frame = frame;
		this.timestamp = timestamp;
		this.index=  index;
	}
}

class Video {
	get cachedFrameCount() {
		return this.frames.length;
	}

	constructor({videoName}) {
		this.name = videoName;
		this.frames = [];
		this.totalFrameCount = 0;

		this.frameIndex = 0;
	}

	addFrame(frame) {
		this.frames.push(new VideoFrame({frame, timestamp: +new Date(), index: this.frameIndex++}));
	}

	getFrame(index) {
		return this.frames[index];
	}


}


import { FrameDecoder } from './frame-decoder';
import { WsClient } from './ws-client';

export class VideoLib {
	constructor({wsUrl, videoNames}) {
		this.wsUrl = wsUrl;

		//todo: load all

		this.videos = videoNames.map(videoName => new Video({videoName}));

		this.videos.forEach(video => this.startPreload(video));
	}

	startPreload(video) {
		const frameDecoder = new FrameDecoder();
		const wsClient = new WsClient({url: this.wsUrl, fileMask: video.name});

		wsClient.onFrameGot.subscribe(frame => frameDecoder.decode(frame));
		wsClient.onFrameCountGot.subscribe(frameCount => video.totalFrameCount = frameCount);

		frameDecoder.onFrameDecoded.subscribe(frame => video.addFrame(frame));
	}

	getVideo(videoName) {
		let foundVideo = this.videos.find(video => video.name === videoName);

		//add as new if not exist
		if (!foundVideo) {
			foundVideo = new Video({videoName});
			this.videos.push(foundVideo);
		}

		return foundVideo;
	}

	getVideoFrame(videoName, frameIndex) {
		let video = this.getVideo(videoName);
		return video.getFrame(frameIndex);
	}

	//todo: make observable?
	getTotalFrameCount() {
		return Math.min(...this.videos.map(video => video.totalFrameCount));
	}

	//todo: make observable?
	getCachedFrameCount() {
		return Math.min(...this.videos.map(video => video.cachedFrameCount));
	}

}
