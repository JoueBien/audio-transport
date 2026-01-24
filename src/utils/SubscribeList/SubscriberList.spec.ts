import { getSubscriberId } from "./getSubscriberId";
import { SubscriberList } from "./SubscriberList";

describe("SubscriberList", () => {
  it("starts up and shutdowns", () => {
    const list1 = new SubscriberList({ stepInterval: 200 });
    list1.destructor();

    const list2 = new SubscriberList({ stepInterval: 200 });
    list2.cleanUpController.abort();
  });

  it("set and get work", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const list = new SubscriberList({ stepInterval: 50 });

    const expireAt = 200;

    // Add items to watch for.
    list.addSubscriber({
      remoteAddress: "10.10.01.10",
      remotePort: 9000,
      reason: "/sub/meter1",
      expiresIn: expireAt,
    });
    list.addSubscriber({
      remoteAddress: "10.10.01.10",
      remotePort: 9000,
      reason: "/sub/meter2",
      expiresIn: expireAt,
    });

    list.addSubscriber({
      remoteAddress: "11.11.11.4",
      remotePort: 9001,
      reason: "/sub/faders",
      expiresIn: expireAt,
    });

    list.addSubscriber({
      remoteAddress: "11.11.11.4",
      remotePort: 9001,
      reason: "/sub/faders",
      expiresIn: expireAt,
    });

    list.addSubscriber({
      remoteAddress: "11.11.11.4",
      remotePort: 9001,
      reason: "/sub/faders",
      expiresIn: expireAt + 2,
    });

    // Run the first seps to add values.
    vi.advanceTimersByTime(100);
    const listCopy1 = JSON.parse(JSON.stringify(list.subscribers));

    // Get values while they are avalilable internally.
    const res1 = list.getSubscribersByReason("/sub/meter1");
    const res2 = list.getSubscribersByRemoteAddress("10.10.01.10");
    const res3 = list.getSubscribersByRemotePort(9000);

    // Run the step so values are removed.
    vi.advanceTimersByTime(500);
    const listCopy2 = JSON.parse(JSON.stringify(list.subscribers));

    // Clean up before asertions so we don't leak a timer.
    list.destructor();

    // Make sure list has values at 100 but no values at 500.
    expect(Object.keys(listCopy1).length).toBe(3);
    expect(listCopy1).toMatchObject({
      [getSubscriberId({
        remoteAddress: "10.10.01.10",
        remotePort: 9000,
        reason: "/sub/meter1",
        expiresIn: expireAt,
      })]: {
        remoteAddress: "10.10.01.10",
        remotePort: 9000,
        reason: "/sub/meter1",
        expiresIn: expireAt,
      },

      [getSubscriberId({
        remoteAddress: "10.10.01.10",
        remotePort: 9000,
        reason: "/sub/meter2",
        expiresIn: expireAt,
      })]: {
        remoteAddress: "10.10.01.10",
        remotePort: 9000,
        reason: "/sub/meter2",
        expiresIn: expireAt,
      },

      [getSubscriberId({
        remoteAddress: "11.11.11.4",
        remotePort: 9001,
        reason: "/sub/faders",
        expiresIn: expireAt,
      })]: {
        remoteAddress: "11.11.11.4",
        remotePort: 9001,
        reason: "/sub/faders",
        expiresIn: expireAt + 2,
      },
    });
    expect(listCopy2).toMatchObject({});

    // Make sure items were fetched by there look up functions
    expect(res1).toMatchObject([
      getSubscriberId({
        remoteAddress: "10.10.01.10",
        remotePort: 9000,
        reason: "/sub/meter1",
        expiresIn: expireAt,
      }),
    ]);

    expect(res2).toMatchObject([
      getSubscriberId({
        remoteAddress: "10.10.01.10",
        remotePort: 9000,
        reason: "/sub/meter1",
        expiresIn: expireAt,
      }),
      getSubscriberId({
        remoteAddress: "10.10.01.10",
        remotePort: 9000,
        reason: "/sub/meter2",
        expiresIn: expireAt,
      }),
    ]);

    expect(res3).toMatchObject([
      getSubscriberId({
        remoteAddress: "10.10.01.10",
        remotePort: 9000,
        reason: "/sub/meter1",
        expiresIn: expireAt,
      }),
      getSubscriberId({
        remoteAddress: "10.10.01.10",
        remotePort: 9000,
        reason: "/sub/meter2",
        expiresIn: expireAt,
      }),
    ]);
  });
});
