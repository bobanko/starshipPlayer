//import * as Decoder from 'broadwayjs';
import * as Decoder from '../lib/Decoder';


//todo: rxify all this shit - as subj

//.next(put frame here)

//.subscribe(get decoded frame here)


export class FrameDecoder {


    constructor(onPictureDecoded) {
        this.decoder = new Decoder();

        //todo: make rx
        this.decoder.onPictureDecoded = onPictureDecoded;
    }

    decode(frame) {
        this.decoder.decode(frame);
    }

}