import { getSubscriberId } from "./getSubscriberId";
import { nowPlusMS } from "./timeUtils";
import {
  Subscriber,
  SubscriberAndExpireListner,
  SubscriberId,
  Subscribers,
} from "./types";

/**
 * A class that is used to keep track of what clients are subscribed to.
 * Clients are automatically culled at an intival if they don't subscribe often enough.
 */
export class SubscriberList {
  /** List of clients that need updates. */
  subscribers: Subscribers = {};

  /** Cean up andy running infivals on siginal. */
  cleanUpController: AbortController;

  /** The intival to check that subscriptions are valid. */
  private stepInterval: number;

  /** The numbr of add actions to preform in each queue step. */
  private stepActions: number;

  /** If the tep function can make writes to the subscribers. */
  private lock: boolean = false;

  /** A queue of items scheduled to be added or removed. First in first processed. */
  private queue: (
    | {
        add: Subscriber;
      }
    | { remove: SubscriberId }
  )[] = [];

  constructor(params: {
    /** The intival to check that subscriptions are valid.
     * @default 100ms
     */
    stepInterval?: number;

    /** The numbr of add actions to preform in each queue step.
     * @default 50
     */
    stepActions?: number;
  }) {
    this.stepInterval = params.stepInterval || 100;
    this.stepActions = params.stepActions || 50;

    // Make sure everything everything is cleaned up so we don't leak timers.
    this.cleanUpController = new AbortController();
    const intervalId = setInterval(() => this.nextStep(), this.stepInterval);
    this.cleanUpController.signal.onabort = () => {
      // Clean up the check intivals.
      clearInterval(intervalId);
      // Clean up any pending subscrbers.
      Object.keys(this.subscribers).forEach((key) => {
        const sub: SubscriberAndExpireListner = this.subscribers[key];
        clearTimeout(sub.intervalId);
      });
    };
  }

  /** Add a subscriber to the list.
   * This add's it to the queue to the queue.
   */
  addSubscriber(params: Subscriber) {
    this.queue.push({
      add: params,
    });
  }

  /** Remove a subscriber to the list.
   * This add's the request to the queue.
   */
  removeSubscriber(subscriberId: SubscriberId) {
    this.queue.push({
      remove: subscriberId,
    });
  }

  /** On a fixed time shcedule add and remove subcribers. */
  private nextStep() {
    // Do not run multiple ticks at once.
    if (this.lock) {
      return;
    }
    this.lock = true;

    // Calculate how many itteratioons we can do in the for loop
    // This allows us to exit as early as possible.
    const noOfActions =
      this.queue.length > this.stepActions
        ? this.stepActions
        : this.queue.length;

    for (let i = 0; i < noOfActions; i++) {
      const step = this.queue.shift();
      if (step && "add" in step) {
        const id = getSubscriberId(step.add);
        const subscrber: SubscriberAndExpireListner | undefined =
          this.subscribers[id];
        // clear subscriber listner if there is one already there.
        if (subscrber) {
          clearTimeout(subscrber.intervalId);
        }

        // Add subscriber onto the Record of them.
        this.subscribers[id] = {
          ...step.add,
          intervalId: setTimeout(() => {
            this.removeSubscriber(id);
          }, step.add.expiresIn),
          expiresAt: nowPlusMS(step.add.expiresIn),
        };
      }

      if (step && "remove" in step) {
        {
          const id = step.remove;
          const subscrber: SubscriberAndExpireListner | undefined =
            this.subscribers[id];
          const now = new Date().getTime();
          // Delete only if it has expired.
          if (subscrber && now > subscrber.expiresAt) {
            clearTimeout(subscrber.intervalId);
            delete this.subscribers[id];
          }
        }
      }
    }
    // Free the lock so the next schduled step can run.
    this.lock = false;
  }

  // TODO: Swap over to map so we don't need the type cast
  getSubscribersByReason(reason: string): SubscriberId[] {
    const keys = Object.keys(this.subscribers).filter((key) => {
      const subscriber: Subscriber | undefined = this.subscribers[key];
      return subscriber.reason === reason;
    });
    return keys as SubscriberId[];
  }

  // TODO: Swap over to map so we don't need the type cast
  getSubscribersByRemoteAddress(remoteAddress: string): SubscriberId[] {
    const keys = Object.keys(this.subscribers).filter((key) => {
      const subscriber: Subscriber | undefined = this.subscribers[key];
      return subscriber.remoteAddress === remoteAddress;
    });
    return keys as SubscriberId[];
  }

  // TODO: Swap over to map so we don't need the type cast
  getSubscribersByRemotePort(remotePort: number): SubscriberId[] {
    const keys = Object.keys(this.subscribers).filter((key) => {
      const subscriber: Subscriber | undefined = this.subscribers[key];
      return subscriber.remotePort === remotePort;
    });
    return keys as SubscriberId[];
  }

  /** Call the clean up functions.
   * This is a wrapper for the abort contorller.
   */
  destructor() {
    this.cleanUpController.abort();
  }
}
