export function decodeAndPopUnsignedInt64Bit(
  unit8Buf: Uint8Array<ArrayBuffer>,
) {
  const intBuf = unit8Buf.slice(0, 8).reverse();
  const number = new DataView(
    intBuf.buffer,
    intBuf.byteOffset,
    intBuf.byteLength,
    // Bits are already in network order.
  ).getBigUint64(0, true);
  const nextBuf = unit8Buf.slice(8);
  return {
    number,
    unit8Array: nextBuf,
  };
}
