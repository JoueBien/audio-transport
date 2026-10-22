import { bufferToPaddedBuffer } from "./bufferToPaddedBuffer.ts";
import { stringToPaddedBuffer, textEncoder } from "./stringToPaddedBuffer.ts";

export { intEncoder } from "./intSigned.ts";
export { unsignedIntEncoder } from "./intUnsigned.ts";

export const floatEncoder = {
  encode: function encode(number: number) {
    return new Uint8Array(Float32Array.of(number).buffer).reverse();
  },
};

export const stringEncoder = {
  encodePadded: function encodePadded(str: string) {
    return stringToPaddedBuffer(str);
  },
  encodeChars: function encodeChars(chars: string) {
    return textEncoder.encode(chars);
  },
  encodeTerminated: function encodeTerminated(str: string) {
    return Uint8Array.from([
      ...textEncoder.encode(str),
      textEncoder.encode("\x00"),
    ]);
  },
};

export const bufferEncoder = {
  encodePadded: function encodePadded(buffer: Uint8Array<ArrayBuffer>) {
    return bufferToPaddedBuffer(buffer);
  },
};
