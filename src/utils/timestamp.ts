export const timestamp = {
  /**
   * Get a 64 bit time relative to a known fixed point.
   * This timestamp is suitable for use in RTP Midi messages.
   */
  nowRTP(): bigint {
    return BigInt(Math.trunc(performance.timeOrigin + performance.now() * 10));
  },
};
