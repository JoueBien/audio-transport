import { textDecoder } from "../encoders/stringToPaddedBuffer";

export function decodeAndPopTerminatedString(
  unit8Array: Uint8Array<ArrayBuffer>,
) {
  const strEndsAt = unit8Array.indexOf(0);
  const strBuffer = unit8Array.slice(0, strEndsAt);
  const str = textDecoder.write(strBuffer);

  const stringEndAtWithNull = strEndsAt + 1;

  if (strEndsAt > 0) {
    return {
      popped: stringEndAtWithNull,
      str,
      unit8Array: unit8Array.slice(stringEndAtWithNull),
    };
  }

  /** If not found then a popped of 0 is returned. */
  return {
    popped: 0,
    str: "",
    unit8Array: unit8Array,
  };
}
