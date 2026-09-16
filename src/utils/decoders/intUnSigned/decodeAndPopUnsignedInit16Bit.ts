export function decodeAndPopUnsignedInit16Bit(
  unit8Buf: Uint8Array<ArrayBuffer>,
) {
  const intBuf = unit8Buf.slice(0, 2).reverse();
  const [number] = Array.from(
    new Uint16Array(intBuf.buffer, intBuf.byteOffset, intBuf.byteLength / 2),
  );

  const nextBuf = unit8Buf.slice(2);
  return {
    number,
    unit8Array: nextBuf,
  };
}
