import { textDecoder } from "../encoders/stringToPaddedBuffer";

export function decodeAndPopTerminatedString(
  unit8Buf: Uint8Array<ArrayBuffer>
) {
  const strEndsAt = unit8Buf.indexOf(0);
  const strBuffer = unit8Buf.slice(0, strEndsAt);
  const str = textDecoder.write(strBuffer);

  const stringEndAtWithNull = strEndsAt + 1;

  return {
    str,
    unit8Array: unit8Buf.slice(stringEndAtWithNull),
  };
}
