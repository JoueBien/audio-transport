import { counterFactory } from "./counterFactory";

const randomSpy = vi.spyOn(Math, "random");

describe("counterFactory", () => {
  beforeEach(() => {
    randomSpy.mockReset();
  });

  it("generates a random number inclusive of min/max", () => {
    const getNextCounterNumber = counterFactory(0, 16);
    const res = getNextCounterNumber();

    expect(res).toBeGreaterThanOrEqual(0);
    expect(res).toBeLessThanOrEqual(16);
  });

  it("generates a random if min and max is negitive", () => {
    const getNextCounterNumber = counterFactory(-5, -1);
    const res = getNextCounterNumber();

    expect(res).toBeGreaterThanOrEqual(-5);
    expect(res).toBeLessThanOrEqual(-1);
  });

  it("generates a random if min is negitive", () => {
    randomSpy.mockReturnValueOnce(0);
    const getNextCounterNumber = counterFactory(-2, 16);
    const res1 = getNextCounterNumber();
    const res2 = getNextCounterNumber();

    expect(res1).toBe(-1);
    expect(res2).toBe(0);
  });

  it("generates a random and counts up", () => {
    randomSpy.mockReturnValueOnce(0);
    const getNextCounterNumber = counterFactory(0, 16);
    const res1 = getNextCounterNumber();
    const res2 = getNextCounterNumber();

    expect(res1).toBe(1);
    expect(res2).toBe(2);
  });

  it("generates a random and returns to min after max", () => {
    randomSpy.mockReturnValueOnce((1 / 16) * 15);
    const getNextCounterNumber = counterFactory(0, 16);
    const res1 = getNextCounterNumber();
    const res2 = getNextCounterNumber();

    expect(res1).toBe(16);
    expect(res2).toBe(0);
  });
});
