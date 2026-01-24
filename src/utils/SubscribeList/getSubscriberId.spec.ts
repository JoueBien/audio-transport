import { getSubscriberId } from "./getSubscriberId";

describe("getSubscriberId", () => {
  it("encodes an id", () => {
    const res = getSubscriberId({
      reason: "/123",
      remoteAddress: "192.168.0.2",
      remotePort: 9000,
      expiresIn: 10000,
    });

    expect(res).toBe("192.168.0.2:9000:/123");
  });
});
