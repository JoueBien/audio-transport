/**
 * Used to generate a counter with a random starting position.
 * Requesting a number will provide an int, inclusive of the min and max.
 * After reaching the max the min will be returned as the next number.
 *
 * Negative numbers are supported, but min must still be smaller than max.
 *
 * @example
 * ```ts
 * const getNextCounterNumber = counterFactory(0, 16);
 * const first = getNextCounterNumber(); // 5
 * const second = getNextCounterNumber(); // 6
 * // ...
 * const first = getNextCounterNumber(); // 16
 * const second = getNextCounterNumber(); // 0
 * ```
 */
export function counterFactory(min: number, max: number) {
  let currentIndex = Math.floor(Math.random() * (max - min)) + min;

  return function getNextCounterNumber() {
    if (currentIndex === max) {
      currentIndex = min;
    } else {
      currentIndex += 1;
    }

    return currentIndex;
  };
}
