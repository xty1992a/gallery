import Tween from "./tween.js";

const dftOption = {
  duration: 300,
  start: 0,
  end: 0,
  easing: Tween.Linear
};

interface Props {
  start: number | number[];
  end: number | number[];
  duration?: number;
  easing?: TweenFn;
}

type NumberOrNumberArray = number | number[];

export default class TweenManager<T extends NumberOrNumberArray> {
  // region types
  $options: Props;
  stamp: number;

  // endregion

  get distance() {
    const { end, start } = this.$options;
    if (typeof end === "number" && typeof start === "number") {
      return end - start;
    }
    if (Array.isArray(end) && Array.isArray(start)) {
      return end.map((e, i) => e - start[i]);
    }
  }

  get now() {
    return Date.now ? Date.now() : new Date().getTime();
  }

  get currentStep() {
    return this.now - this.stamp;
  }

  get currentValue(): T {
    const { distance, currentStep } = this;
    const { duration, easing, start } = this.$options;
    if (typeof distance === "number" && typeof start === "number") {
      return easing(currentStep, start, distance, duration) as T;
    }
    if (Array.isArray(distance) && Array.isArray(start)) {
      return distance.map((d, i) =>
        easing(currentStep, start[i], d, duration)
      ) as T;
    }
  }

  constructor(opt: Props) {
    this.$options = { ...dftOption, ...(opt || {}) };
    this.stamp = this.now;
  }

  next() {
    return this.$options.duration > this.currentStep;
  }

  static sleep(time = 0) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  static frame() {
    return requestAnimationFrame
      ? new Promise(requestAnimationFrame)
      : TweenManager.sleep(16);
  }
}
