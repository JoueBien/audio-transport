import { textDecoder } from "../encoders/stringToPaddedBuffer";

export function decodeAndPopChars(
  unit8Buf: Uint8Array<ArrayBuffer>,
  noOfChars: number
) {
  const strBuffer = unit8Buf.slice(0, noOfChars);
  const str = textDecoder.write(strBuffer);

  return {
    str,
    unit8Array: unit8Buf.slice(noOfChars),
  };
}
