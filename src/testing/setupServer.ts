import { UdpTransport, type UdpTransportParams } from "../UdpTransport.ts";
import { beforeEach, afterEach, vi } from "vitest";

export function setupServer(params?: Partial<UdpTransportParams>) {
  let server: UdpTransport;

  const serverOnSpy = vi.fn();

  beforeEach(() => {
    server = new UdpTransport({
      responsePort: 9000,
      ...params,
    });

    server.onMessage((event) => {
      serverOnSpy(event);
    });
  });

  // Make sure we clean up.
  afterEach(() => {
    server.cleanUpController.abort();
  });

  function getCurrentServer() {
    return server;
  }

  return {
    /** Get the current server that has been set up. */
    getCurrentServer,
    serverOnSpy,
  };
}
