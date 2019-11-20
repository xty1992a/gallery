import { limit, order, isHit, debounce } from "../src/helpers/utils";

test("order [1,2] to be [1,2]", () => {
  expect(order([1, 2]) + "").toBe("1,2");
});
test("order [2,1] to be [1,2]", () => {
  expect(order([2, 1]) + "").toBe("1,2");
});

test("limit(0,10) lower", () => {
  expect(limit(0, 10)(-1)).toBe(0);
});
test("limit(0,10) middle ", () => {
  expect(limit(0, 10)(5)).toBe(5);
});
test("limit(0,10) upper ", () => {
  expect(limit(0, 10)(11)).toBe(10);
});

const innerPoint = { x: 15, y: 15 };
const outPoints = [
  { x: 0, y: 0 },
  { x: 15, y: 0 },
  { x: 30, y: 0 },
  { x: 0, y: 15 },
  { x: 30, y: 15 },
  { x: 0, y: 30 },
  { x: 15, y: 30 },
  { x: 30, y: 30 }
];
const rect = {
  top: 10,
  left: 10,
  right: 20,
  bottom: 20
};

test("isHit outList all be false", () => {
  expect(outPoints.every(it => !isHit(it, rect))).toBe(true);
});
test("isHit inner be true", () => {
  expect(isHit(innerPoint, rect)).toBe(true);
});

test("debounce limit events times", done => {
  const box: number[] = [];
  const fillBox = () => box.push(1);
  const debouncedFn = debounce(fillBox);
  let count = 0;
  // 10ms/次的频率调用fillBox,debounce生效则应只有最后一次有效
  const timer = global.setInterval(() => {
    count++;
    debouncedFn();
    if (count >= 10) {
      setTimeout(() => {
        expect(box.length === 1).toBe(true);
        done();
      }, 200);
      return clearInterval(timer);
    }
  }, 10);
});
