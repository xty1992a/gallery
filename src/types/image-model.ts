import { AnyObj } from "./index";
import Store from "../helpers/store";

export default interface IImageModel {
  onAnimation: boolean;
  init: () => void;
  startAnimation: (direction: number) => void;
  start: () => void;
  restore: () => void;
  shouldNext: () => boolean;
  shouldPrev: () => boolean;
  nextFrame: () => boolean;
  zoom: (position: { x: number; y: number }, direction: number) => void;
  move: (delta: { x: number; y: number }) => void;
}

export type ImageModelProps = {
  imageUrl: string;
  store: Store;
};
