import IImageModel, { ImageModelProps } from "../types/image-model";
import TweenManger from "../helpers/tween-manager";
import Store from "../helpers/store";
import { AnyObj } from "../types/index";

export default class ImageModel implements IImageModel {
  // region types
  $store: Store;
  WIDTH: number;
  HEIGHT: number;
  $options: AnyObj;
  img: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  initialX: number;
  initialY: number;
  initialWidth: number;
  initialHeight: number;
  scale: number;
  onAnimation: boolean;
  animationManger: TweenManger;
  $props: ImageModelProps;
  position: {
    x: number;
    y: number;
  };

  // endregion

  constructor(props: ImageModelProps) {
    this.$store = props.store;
    this.$props = props;
  }

  // region 计算属性
  get RATIO() {
    return this.WIDTH / this.HEIGHT;
  }

  // endregion

  async init() {
    if (this.img) return;
    const props = this.$props;
    await this.createImage(props.imageUrl);
    if (this.$options) return;
    this.mapStore();
    if (!this.img) throw `can not create img by ${props.imageUrl}`;
    this.initPosition();
  }

  async createImage(url: string) {
    this.img = await ImageModel.loadImage(url);
  }

  initPosition() {
    const {
      img: { width, height },
      WIDTH,
      HEIGHT,
      $options,
      RATIO
    } = this;
    const ratio = width / height;
    console.log(width, WIDTH, RATIO, ratio);
    switch ($options.imageFit) {
      case "cover":
        if (ratio > RATIO) {
          this.height = HEIGHT;
          this.width = HEIGHT * ratio;
        } else {
          this.width = WIDTH;
          this.height = WIDTH / ratio;
        }
        this.x = (WIDTH - this.width) / 2;
        this.y = (HEIGHT - this.height) / 2;
        break;
      case "contain":
        if (ratio > RATIO) {
          this.width = WIDTH;
          this.height = WIDTH / ratio;
        } else {
          this.height = HEIGHT;
          this.width = WIDTH / ratio;
        }
        this.x = (WIDTH - this.width) / 2;
        this.y = (HEIGHT - this.height) / 2;
        break;
    }

    this.scale = 1;
    this.initialWidth = this.width;
    this.initialHeight = this.height;
    this.initialX = this.x;
    this.initialY = this.y;
  }

  static loadImage(url: string): Promise<HTMLImageElement | null> {
    return new Promise(resolve => {
      const img = new Image();
      img.addEventListener("load", () => resolve(img));
      img.addEventListener("error", () => resolve(null));
      img.src = url;
    });
  }

  start() {
    this.position = {
      x: this.x,
      y: this.y
    };
  }

  shouldNext() {
    return this.x < -this.WIDTH / 3;
  }

  shouldPrev() {
    return this.x > this.WIDTH / 3;
  }

  move(delta: { x: number; y: number }) {
    this.x = this.position.x + delta.x;
    this.y = this.position.y + delta.y;
  }

  zoom(position: { x: number; y: number }, direction: number) {
    const origin = {
      x: position.x - this.x,
      y: position.y - this.y
    };
    const scale = (this.scale += direction * 0.05);
    const newWidth = this.initialWidth * Math.sqrt(scale);
    const newHeight = this.initialHeight * Math.sqrt(scale);
    const dx = this.x + (origin.x - (origin.x / this.width) * newWidth);
    const dy = this.y + (origin.y - (origin.y / this.height) * newHeight);
    this.x = Math.min(dx, 0);
    this.y = Math.min(dy, 0);
    this.width = Math.max(newWidth, this.WIDTH);
    this.height = Math.max(newHeight, this.HEIGHT);
  }

  // 还原
  restore() {
    this.onAnimation = false;
    this.position = {
      x: 0,
      y: 0
    };
    this.x = this.initialX;
    this.y = this.initialY;
    this.width = this.initialWidth;
    this.height = this.initialHeight;
  }

  startAnimation(direction: number) {
    this.onAnimation = true;

    this.animationManger = new TweenManger({
      start: this.x,
      end: -direction * this.WIDTH
    });
  }

  nextFrame() {
    if (!this.onAnimation) return;
    const flag = this.animationManger.next();
    this.x = this.animationManger.currentValue;
    return flag;
  }

  // 将store中的字段映射到本类中
  mapStore() {
    this.$store.mapState({ $options: "options" }).call(this);
    this.$store.mapGetters(["WIDTH", "HEIGHT"]).call(this);
  }
}
