import Tween from "./tween.js";

const dftOption = {
  duration: 300,
  start: 0,
  end: 0,
  easing: Tween.Linear
};

interface Props {
  start: number;
  end: number;
  duration?: number;
  easing?: TweenFn;
}

export default class TweenManager {
  // region types
  $options: {
    [prop: string]: any;
  };

  stamp: number;

  // endregion

  get distance() {
    return this.$options.end - this.$options.start;
  }

  get now() {
    return Date.now ? Date.now() : new Date().getTime();
  }

  get currentStep() {
    return this.now - this.stamp;
  }

  get currentValue() {
    const { distance, currentStep } = this;
    const { duration, easing, start } = this.$options;
    return easing(currentStep, start, distance, duration);
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
