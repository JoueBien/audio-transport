import { bufferToPaddedBuffer } from "./bufferToPaddedBuffer";
import { stringToPaddedBuffer, textEncoder } from "./stringToPaddedBuffer";

export { intEncoder } from "./intSigned";
export { unsignedIntEncoder } from "./intUnsigned";

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
