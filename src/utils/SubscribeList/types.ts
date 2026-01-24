/** A unique string ID used to identify a stored Subscriber in SubscriberList.
 */
export type SubscriberId =
  `${Subscriber["remoteAddress"]}:${Subscriber["remotePort"]}:${Subscriber["reason"]}`;

/** A struct representing what the subscription is for and where replay should be sent to.
 */
export type Subscriber = {
  /** The port to reply to. */
  remotePort: number;
  /** The IP address to reply to. */
  remoteAddress: string;
  /** The string address for what is subscribed to. */
  reason: string;
  /** A positive whole number representing how long the subscriber is valid for in milloseconds. */
  expiresIn: number;
};

/** A struct representing used to keep track of when the subscription should expire.
 */
export type SubscriberAndExpireListner = Subscriber & {
  /** A referane to a intival that is called when the subscription expires. */
  intervalId: ReturnType<typeof setTimeout>;
  /** A positive whole number representing the time that the subscriber will expire at. */
  expiresAt: number;
};

/** A list off all the current SubscriberAndExpireListner stored in `SubscriberList`.
 */
export type Subscribers = Record<SubscriberId, SubscriberAndExpireListner>;
