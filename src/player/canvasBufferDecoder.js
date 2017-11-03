import * as config from '../../config';

export function decodeFrameBuffer(buffer, width = config.videoSize.width, height = config.videoSize.height) {
	if (!buffer)
		return;

	const canvasBuffer = new ImageData(width, height);

	const lumaSize = width * height;
	const chromaSize = lumaSize >> 2;

	const ybuf = buffer.subarray(0, lumaSize);
	const ubuf = buffer.subarray(lumaSize, lumaSize + chromaSize);
	const vbuf = buffer.subarray(lumaSize + chromaSize, lumaSize + 2 * chromaSize);

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const yIndex = x + y * width;
			const uIndex = ~~(y / 2) * ~~(width / 2) + ~~(x / 2);
			const vIndex = ~~(y / 2) * ~~(width / 2) + ~~(x / 2);
			const R = 1.164 * (ybuf[yIndex] - 16) + 1.596 * (vbuf[vIndex] - 128);
			const G = 1.164 * (ybuf[yIndex] - 16) - 0.813 * (vbuf[vIndex] - 128) - 0.391 * (ubuf[uIndex] - 128);
			const B = 1.164 * (ybuf[yIndex] - 16) + 2.018 * (ubuf[uIndex] - 128);

			const rgbIndex = yIndex * 4;
			canvasBuffer.data[rgbIndex + 0] = R;
			canvasBuffer.data[rgbIndex + 1] = G;
			canvasBuffer.data[rgbIndex + 2] = B;
			canvasBuffer.data[rgbIndex + 3] = 0xff;
		}
	}

	return canvasBuffer;
}
