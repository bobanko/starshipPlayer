//import * as Decoder from 'broadwayjs';

import * as Decoder from '../lib/Decoder';

import {Player} from './player';


const socket = new WebSocket('ws://localhost:9090');
socket.binaryType = "arraybuffer";

const player = new Player(document.querySelector('canvas'));


socket.onopen = function () {
    console.log("Соединение установлено.");
};

socket.onclose = function (event) {
    if (event.wasClean) {
        console.log('Соединение закрыто чисто');
    } else {
        console.log('Обрыв соединения'); // например, "убит" процесс сервера
    }
    console.log('Код: ' + event.code + ' причина: ' + event.reason);
};

let framesList = [];


socket.onmessage = function (event) {
    //console.log("Получены данные " + event.data);

    if (typeof event.data === "string") {
        return;
    }

    //binary
    let frame = new Uint8Array(event.data);
    framesList.push(frame);

};

socket.onerror = function (error) {
    console.log("Ошибка " + error.message);
};


let decoder = new Decoder();

decoder.onPictureDecoded = function (buffer, width, height) {
    //console.log('decoded', buffer);


    player.decode(buffer, width, height)
}; // override with a callback function


function decode(frame) {
    //console.log('decoding');
    decoder.decode(frame);
}

function shiftFrame() {

    const frame = framesList.shift();

    if (frame)
        decode(frame);

    requestAnimationFrame(shiftFrame);
}

window.framesList = framesList;

window.shiftFrame = shiftFrame;

shiftFrame();
