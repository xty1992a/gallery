import Ring from "../src/helpers/ring";

const oneMemberRing = new Ring([1]);
test("ring [1] 1 prev be 1", () => {
  expect(oneMemberRing.getPrevBy(1) === 1).toBe(true);
});
test("ring [1] 1 next be 1", () => {
  expect(oneMemberRing.getNextBy(1) === 1).toBe(true);
});

const ring = new Ring([1, 2, 3, 4, 5]);
test("ring [1, 2, 3, 4, 5] 1 next be 2", () => {
  expect(ring.getNextBy(1) === 2).toBe(true);
});
test("ring [1, 2, 3, 4, 5] 1 prev be 5", () => {
  expect(ring.getPrevBy(1) === 5).toBe(true);
});
test("ring [1, 2, 3, 4, 5] 5 next be 1", () => {
  expect(ring.getNextBy(5) === 1).toBe(true);
});
