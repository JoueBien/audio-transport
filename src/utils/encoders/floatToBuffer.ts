import { floatEncoder } from ".";

/** Encode int to buffer and reverse the bits. */
export function floatToBuffer(num: number): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(floatEncoder.encode(num)).reverse();
}
