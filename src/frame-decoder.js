const Rx = require('rxjs/Rx');
import * as Decoder from '../lib/Decoder';

export class FrameDecoder {

    constructor() {
        let onFrameDecodedSubject = new Rx.Subject();

        this.decoder = new Decoder();
        this.decoder.onPictureDecoded = (buffer, ...args) => onFrameDecodedSubject.next(new Uint8Array(buffer), ...args);

        this.onFrameDecoded = onFrameDecodedSubject.asObservable();
        this.decode = (frame) => this.decoder.decode(frame);
    }
}