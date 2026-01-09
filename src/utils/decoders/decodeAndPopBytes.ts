export function decodeAndPopBytes(
  unit8Buf: Uint8Array<ArrayBuffer>,
  noOfBytes: number
) {
  const strBuffer = unit8Buf.slice(0, noOfBytes);

  return {
    bytes: strBuffer,
    unit8Array: unit8Buf.slice(noOfBytes),
  };
}
