import { Failure } from "fail-up";
import { MockUdpServer, mockUdpServer } from "./mocks/mockUdpServer";
import { UdpTransport } from "./UdpTransport";
import { decodeAndPopPaddedString } from "./utils/decoders/decodeAndPopPaddedString";
import { stringEncoder } from "./utils/encoders";

let serverPtr: MockUdpServer;

describe("UdpTransport", () => {
  beforeAll(async () => {
    serverPtr = await mockUdpServer();
  });

  afterAll(() => {
    serverPtr.controller.abort();
  });

  it("isConnectionOk reports state correctly", async () => {
    const client = new UdpTransport({
      remotePort: 9000,
      responsePort: 9001,
    });

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

    // Clean up at end.
    client.cleanUpController.abort();
  });

  it("isListeningOk reports state correctly", async () => {
    const client = new UdpTransport({
      // remotePort: 9000,
      responsePort: 9001,
    });

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

    // Clean up at end.
    client.cleanUpController.abort();
  });

  it("sends a message", async () => {
    const client = new UdpTransport({
      remotePort: 9000,
      responsePort: 9001,
    });

    await client.connect();
    const sendMessage = stringEncoder.encodePadded("/message");

    const response = serverPtr.waitForSpecificMessageOnServer({
      matches: Buffer.from(stringEncoder.encodePadded("/message")),
    });
    await client.send(sendMessage);

    const messageReceived = await response;

    client.cleanUpController.abort();

    if (messageReceived instanceof Failure) {
      throw new Error("returned Failure not message");
    }

    expect(
      decodeAndPopPaddedString(Uint8Array.from(messageReceived.msg)).str
    ).toBe("/message");
  });

  it("responds can send message to remote connections", async () => {
    const response = serverPtr.waitForSpecificMessageOnServer({
      matches: Buffer.from(stringEncoder.encodePadded("/message")),
    });

    // Send message to self
    await serverPtr.respond({
      msg: stringEncoder.encodePadded("/message"),
      remoteAddress: "localhost",
      remotePort: 9000,
    });

    const messageReceived = await response;

    if (messageReceived instanceof Failure) {
      throw new Error("returned Failure not message");
    }

    expect(
      decodeAndPopPaddedString(Uint8Array.from(messageReceived.msg)).str
    ).toBe("/message");
  });

  it("send won't send a message if not connected", async () => {
    const client = new UdpTransport({
      remotePort: 9000,
      responsePort: 9001,
    });

    const res = await client.send(stringEncoder.encodePadded("/message"));

    expect(res).toMatchObject({
      type: "not-connected",
    });

    client.cleanUpController.abort();
  });

  it("respond won't send a message if not listening ", async () => {
    const server = new UdpTransport({
      responsePort: 9001,
    });

    const res = await server.respond({
      msg: stringEncoder.encodePadded("/message"),
      remoteAddress: "localhost",
      remotePort: 9000,
    });

    expect(res).toMatchObject({
      type: "not-listening",
    });

    server.cleanUpController.abort();
  });
});
