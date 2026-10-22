import { UdpTransport, type UdpTransportParams } from "../UdpTransport.ts";
import { beforeEach, afterEach, vi } from "vitest";

export function setupClient(params?: Partial<UdpTransportParams>) {
  let client: UdpTransport;

  const clientOnSpy = vi.fn();

  beforeEach(() => {
    client = new UdpTransport({
      remotePort: 9000,
      responsePort: 9001,
      ...params,
    });

    client.onMessage((event) => {
      clientOnSpy(event);
    });
  });

  // Make sure we clean up.
  afterEach(() => {
    client.cleanUpController.abort();
  });

  function getCurrentClient() {
    return client;
  }

  return {
    /** Get the current client that has been set up. */
    getCurrentClient,
    clientOnSpy,
  };
}
