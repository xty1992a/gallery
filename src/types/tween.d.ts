/*
 * Tween.js
 * t: current time（当前时间）；
 * b: beginning value（初始值）；
 * c: change in value（变化量）；
 * d: duration（持续时间）。
 * you can visit 'https://www.zhangxinxu.com/study/201612/how-to-use-tween-js.html' to get effect
 */

declare interface TweenFn {
  (
    currentTime: number,
    beginValue: number,
    changeValue: number,
    duration: number
  ): number;
}

type TweenMap = {
  easeIn: TweenFn;
  easeOut: TweenFn;
  easeInOut: TweenFn;
};

declare interface Tween {
  Linear: TweenFn;
  Quad: TweenMap;
  Quint: TweenMap;
  Quart: TweenMap;
  Sine: TweenMap;
  Expo: TweenMap;
  Circ: TweenMap;
  Elastic: TweenMap;
  Back: TweenMap;
  Bounce: TweenMap;
}
