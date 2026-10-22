import { Failure } from "fail-up";
import { UdpTransport } from "./UdpTransport";
import { decodeAndPopPaddedString } from "./utils/decoders/decodeAndPopPaddedString";
import { stringEncoder } from "./utils/encoders";
import { describe, it } from "vitest";
import { setupClient } from "./testing/setupClient";
import { setupServer } from "./testing/setupServer";
import { expect } from "vitest";
import { sendAndWaitFor } from "./index.utils-async";
import dgram from "dgram";

describe("UdpTransport", () => {
  const { getCurrentClient } = setupClient();
  const { getCurrentServer } = setupServer();

  it("isConnectionOk reports state correctly", async () => {
    const client = getCurrentClient();

    // Check connection error
    const connectNotRunError = await client.isConnectionOk();
    expect(connectNotRunError).toMatchObject({
      type: "not-connected",
    });

    // Check reports okay after connection
    await client.connect();
    const connectionOkay = await client.isConnectionOk();
    expect(connectionOkay).toBe("ok");

    // Check aborted error
    client.cleanUpController.abort();
    const connectionAbortedError = await client.isConnectionOk();
    expect(connectionAbortedError).toMatchObject({
      type: "aborted",
    });
  });

  it("isListeningOk reports state correctly", async () => {
    const client = getCurrentClient();

    // Check connection error
    const connectNotRunError = await client.isListeningOk();
    expect(connectNotRunError).toMatchObject({
      type: "not-listening",
    });

    // Check reports okay after connection
    await client.listen();
    const connectionOkay = await client.isListeningOk();
    expect(connectionOkay).toBe("ok");

    // Check aborted error
    client.cleanUpController.abort();
    const connectionAbortedError = await client.isListeningOk();
    expect(connectionAbortedError).toMatchObject({
      type: "aborted",
    });
  });

  it("sends a message", async () => {
    const client = getCurrentClient();
    const server = getCurrentServer();

    await client.connect();
    await server.listen();

    const [res] = await sendAndWaitFor({
      send: async () => client.send(stringEncoder.encodePadded("/message")),
      waitFor: () => {
        return new Promise<{
          msg: Buffer;
          rinfo: dgram.RemoteInfo;
        }>((resolve) => {
          server.onOnceMessage((msg: Buffer, rinfo: dgram.RemoteInfo) => {
            resolve({ msg, rinfo });
          });
        });
      },
    });

    expect(res).not.toBeInstanceOf(Failure);
    expect(res).toMatchObject({
      msg: expect.any(Buffer),
      rinfo: { address: "127.0.0.1", family: "IPv4", port: 9001, size: 12 },
    });
    expect(decodeAndPopPaddedString(Uint8Array.from(res.msg)).str).toBe(
      "/message",
    );
  });

  it("responds can send message to remote connections", async () => {
    const client = getCurrentClient();
    const server = getCurrentServer();

    await client.connect();
    await server.listen();

    // Sends to self on server
    const [res] = await sendAndWaitFor({
      send: async () =>
        server.respond({
          msg: stringEncoder.encodePadded("/message"),
          remoteAddress: "localhost",
          remotePort: 9000,
        }),
      waitFor: () => {
        return new Promise<{
          msg: Buffer;
          rinfo: dgram.RemoteInfo;
        }>((resolve) => {
          server.onOnceMessage((msg: Buffer, rinfo: dgram.RemoteInfo) => {
            resolve({ msg, rinfo });
          });
        });
      },
    });

    // Sends to client
    const [res2] = await sendAndWaitFor({
      send: async () =>
        server.respond({
          msg: stringEncoder.encodePadded("/message"),
          remoteAddress: "localhost",
          remotePort: 9001,
        }),
      waitFor: () => {
        return new Promise<{
          msg: Buffer;
          rinfo: dgram.RemoteInfo;
        }>((resolve) => {
          client.onOnceMessage((msg: Buffer, rinfo: dgram.RemoteInfo) => {
            resolve({ msg, rinfo });
          });
        });
      },
    });

    expect(res).not.toBeInstanceOf(Failure);
    expect(res).toMatchObject({
      msg: expect.any(Buffer),
      rinfo: { address: "127.0.0.1", family: "IPv4", port: 9000, size: 12 },
    });
    expect(decodeAndPopPaddedString(Uint8Array.from(res.msg)).str).toBe(
      "/message",
    );

    expect(res2).not.toBeInstanceOf(Failure);
    expect(res2).toMatchObject({
      msg: expect.any(Buffer),
      rinfo: { address: "127.0.0.1", family: "IPv4", port: 9000, size: 12 },
    });
    expect(decodeAndPopPaddedString(Uint8Array.from(res2.msg)).str).toBe(
      "/message",
    );
  });

  it("send won't send a message if not connected", async () => {
    const client = getCurrentClient();

    const res = await client.send(stringEncoder.encodePadded("/message"));

    expect(res).toMatchObject({
      type: "not-connected",
    });
  });

  it("respond won't send a message if not listening ", async () => {
    const server = getCurrentServer();

    const res = await server.respond({
      msg: stringEncoder.encodePadded("/message"),
      remoteAddress: "localhost",
      remotePort: 9000,
    });

    expect(res).toMatchObject({
      type: "not-listening",
    });
  });

  it("accepts an external abort controller", () => {
    const abortController = new AbortController();

    const client1 = new UdpTransport({
      remotePort: 9000,
      responsePort: 9001,
      cleanUpController: abortController,
    });
    const client2 = new UdpTransport({
      remotePort: 9000,
      responsePort: 9001,
      cleanUpController: abortController,
    });

    expect(client1.cleanUpController).toEqual(client2.cleanUpController);

    abortController.abort();

    expect(client1.cleanUpController.signal.aborted).toBeTruthy();
    expect(client2.cleanUpController.signal.aborted).toBeTruthy();
  });

  it("deconstrcutor calls abort controller", () => {
    const client = getCurrentClient();
    client.deconstructor();
    expect(client.cleanUpController.signal.aborted).toBeTruthy();
  });
});
