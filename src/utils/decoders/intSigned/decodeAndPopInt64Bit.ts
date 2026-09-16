export function decodeAndPopInt64Bit(unit8Buf: Uint8Array<ArrayBuffer>) {
  const intBuf = unit8Buf.slice(0, 8).reverse();
  const [number] = Array.from(
    new BigInt64Array(intBuf.buffer, intBuf.byteOffset, intBuf.byteLength / 8)
  );
  const nextBuf = unit8Buf.slice(8);
  return {
    number,
    unit8Array: nextBuf,
  };
}
