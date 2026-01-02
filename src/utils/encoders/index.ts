import { bufferToPaddedBuffer } from "./bufferToPaddedBuffer";
import { stringToPaddedBuffer, textEncoder } from "./stringToPaddedBuffer";

export const intEncoder = {
  encode: function encode(number: number) {
    return new Uint8Array(Uint32Array.of(number).buffer).reverse();
  },
  encode8Bit: function encode(number: number) {
    return new Uint8Array(Uint8Array.of(number).buffer).reverse();
  },
};

export const floatEncoder = {
  encode: function encode(number: number) {
    return new Uint8Array(Float32Array.of(number).buffer).reverse();
  },
};

export const stringEncoder = {
  encodePadded(str: string) {
    return stringToPaddedBuffer(str);
  },
  encodeChars(chars: string) {
    return textEncoder.encode(chars);
  },
};

export const bufferEncoder = {
  encodePadded(buffer: Uint8Array<ArrayBuffer>) {
    return bufferToPaddedBuffer(buffer);
  },
};
