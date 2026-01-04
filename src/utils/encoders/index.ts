import { bufferToPaddedBuffer } from "./bufferToPaddedBuffer";
import { stringToPaddedBuffer, textEncoder } from "./stringToPaddedBuffer";

export const intEncoder = {
  encode: function encode(number: number) {
    return new Uint8Array(Uint32Array.of(number).buffer).reverse();
  },
  encode8Bit: function encode(number: number) {
    return new Uint8Array(Uint8Array.of(number).buffer).reverse();
  },
  encode64Bit: function (number: bigint | number) {
    return new Uint8Array(
      BigInt64Array.of(
        typeof number === "bigint" ? number : BigInt(number)
      ).buffer
    ).reverse();
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
  encodeTerminated(str: string) {
    return Uint8Array.from([
      ...textEncoder.encode(str),
      textEncoder.encode("\x00"),
    ]);
  },
};

export const bufferEncoder = {
  encodePadded(buffer: Uint8Array<ArrayBuffer>) {
    return bufferToPaddedBuffer(buffer);
  },
};
