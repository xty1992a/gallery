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
  dpr: number;
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
  animationManger: TweenManger<number> | TweenManger<number[]>;
  $props: ImageModelProps;
  position: {
    x: number;
    y: number;
  };
  protected zoomDirection: number;

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
          this.width = HEIGHT * ratio;
        }
        this.x = (WIDTH - this.width) / 2;
        this.y = (HEIGHT - this.height) / 2;
        break;
    }

    this.zoomDirection = 1;
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
    console.log(this.x, this.WIDTH);
    return this.x < -this.WIDTH / 3;
  }

  shouldPrev() {
    return this.x > this.WIDTH / 3;
  }

  move(delta: { x: number; y: number }) {
    this.x = this.position.x + delta.x * this.dpr;
    this.y = this.position.y + delta.y * this.dpr;
  }

  zoom(position: { x: number; y: number }, direction: number) {
    const origin = {
      x: position.x * this.dpr - this.x,
      y: position.y * this.dpr - this.y
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
    this.zoomDirection = 1;
    this.onAnimation = false;
    this.position = {
      x: this.initialX,
      y: this.initialY
    };
    this.x = this.initialX;
    this.y = this.initialY;
    this.width = this.initialWidth;
    this.height = this.initialHeight;
  }

  startZoom() {
    this.onAnimation = true;
    const end =
      this.zoomDirection > 0
        ? [-this.width * 5, -this.height * 5, this.width * 10, this.height * 10]
        : [this.initialX, this.initialY, this.initialWidth, this.initialHeight];
    this.zoomDirection = 0 - this.zoomDirection;
    this.animationManger = new TweenManger<number[]>({
      start: [this.x, this.y, this.width, this.height],
      end,
      duration: this.$options.animationDuration,
      easing: this.$options.animationEasing
    });
  }

  startMove(direction: number) {
    this.onAnimation = true;

    // 实例化tween管理器
    this.animationManger = new TweenManger<number>({
      start: this.x,
      end: this.initialX + direction * this.WIDTH,
      duration: this.$options.animationDuration,
      easing: this.$options.animationEasing
    });
  }

  nextFrame() {
    if (!this.onAnimation) return false;
    const flag = this.animationManger.next();
    const value = this.animationManger.currentValue;
    if (typeof value === "number") {
      this.x = value;
    } else if (Array.isArray(value)) {
      this.x = value[0];
      this.y = value[1];
      this.width = value[2];
      this.height = value[3];
    } else {
      return false;
    }
    return flag;
  }

  // 将store中的字段映射到本类中
  mapStore() {
    this.$store.mapState({ $options: "options" }).call(this);
    this.$store.mapGetters(["WIDTH", "HEIGHT", "dpr"]).call(this);
  }
}
