import IGallery, { GalleryProps, Point } from "../types/index";
import store from "./store";
import Store from "../helpers/store";
import { EmitAble } from "../helpers/utils";
import EventsManager from "./events-manager";
import ImageModel from "./image-model";
import { AnyObj } from "../types/index";
import Ring from "../helpers/ring";
import * as utils from "../helpers/utils";

const dftOptions = {
  autoplay: true,
  duration: 1500,
  loop: true,
  zoomable: true,
  touchable: true,
  doubleClickZoom: true,
  imageFit: "cover",
  devicePixelRatio: window.devicePixelRatio || 1
};

function getImageModel(url: string) {
  let model = this.imageModelMap[url];
  if (!model) {
    model = this.imageModelMap[url] = new ImageModel({
      imageUrl: url,
      store: this.$store
    });
  }
  return model;
}

export default class Gallery extends EmitAble implements IGallery {
  //region property types
  $canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  $eventsManger: EventsManager;
  $store: Store;
  $options: AnyObj;
  currentImageUrl: string;
  dpr: number;
  WIDTH: number;
  HEIGHT: number;
  imageModelMap: {
    [prop: string]: ImageModel;
  };
  protected urlRing: Ring;

  protected get currentImage() {
    const url = this.currentImageUrl;
    return getImageModel.call(this, url);
  }

  protected get prevImage() {
    const url = this.prevImageUrl;
    return getImageModel.call(this, url);
  }

  protected get nextImage() {
    const url = this.nextImageUrl;
    return getImageModel.call(this, url);
  }

  //endregion

  // region 计算属性
  get prevImageUrl() {
    return this.urlRing.getPrevBy(this.currentImageUrl);
  }

  get nextImageUrl() {
    return this.urlRing.getNextBy(this.currentImageUrl);
  }

  // endregion

  constructor(props: GalleryProps) {
    super();
    if (!props) throw "expect props";
    const options = Gallery.handlerOptions(props);
    this.init(options);
  }

  async init(options: GalleryProps) {
    this.handlerStore(options);
    this.handlerDOM();
    this.handlerChildren();

    this.handlerEvents();

    this.render();
  }

  static handlerOptions(props: GalleryProps) {
    if (!props.images || !props.images.length)
      throw "images must contain at least one image url";
    if (!props.current) {
      props.current = props.images[0];
    }
    return { ...dftOptions, ...props };
  }

  // region 子组件
  handlerChildren() {
    const options = {
      el: this.$canvas
    };
    this.$eventsManger = new EventsManager(options);

    this.urlRing = new Ring(this.$options.images);
    this.imageModelMap = {};

    this.currentImageUrl = this.$options.current;

    console.log(this.currentImage);
  }

  // endregion

  // region DOM相关
  handlerDOM() {
    const canvas = (this.$canvas = document.createElement("canvas"));
    this.ctx = canvas.getContext("2d");
  }

  handlerEvents() {
    const events = this.$eventsManger;
    events.on("point-down", e => {
      if (this.currentImage.onAnimation) return;
      // console.log("point down", e);
      this.prevImage.start();
      this.currentImage.start();
      this.nextImage.start();
    });
    events.on("point-move", e => {
      // console.log("point move", e, this.currentImage.scale);
      if (this.currentImage.onAnimation) return;
      const delta = {
        x: e.deltaX,
        y: e.deltaY
      };
      if (this.currentImage.scale === 1) {
        delta.y = 0;
        this.prevImage.move(delta);
        this.nextImage.move(delta);
      }
      this.currentImage.move(delta);
      this.render();
    });
    events.on("point-up", e => {
      // console.log("point up ", e);
      if (this.currentImage.onAnimation) return;
      if (this.currentImage.scale !== 1) return;
      if (this.currentImage.shouldNext()) return this.next();
      if (this.currentImage.shouldPrev()) return this.prev();
      console.log(e);
      this.stay(e.directionX);
    });
    events.on("zoom", e => {
      this.currentImage.zoom(e.origin, e.direction);
      this.render();
      console.log("zoom", e);
    });
  }

  // endregion

  // region store 相关
  handlerStore(options: GalleryProps) {
    this.$store = new Store(store);
    this.commitOptions(options);
    this.mapStore();
  }

  commitOptions(options: object) {
    this.$store.commit("SET_OPTIONS", options);
  }

  // 将store中的字段映射到本类中
  mapStore() {
    this.$store.mapState({ $options: "options" }).call(this);
    this.$store.mapGetters(["dpr", "WIDTH", "HEIGHT"]).call(this);
    console.log(this.WIDTH);
  }

  // endregion

  // region 渲染
  async render() {
    const {
      ctx,
      currentImage: current,
      prevImage: prev,
      nextImage: next
    } = this;
    if (!prev.img) await prev.init();
    if (!current.img) await current.init();
    if (!next.img) await next.init();

    const { WIDTH, HEIGHT } = this;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.save();
    ctx.drawImage(prev.img, prev.x - WIDTH, prev.y, prev.width, prev.height);
    ctx.drawImage(next.img, next.x + WIDTH, next.y, next.width, next.height);
    ctx.drawImage(
      current.img,
      current.x,
      current.y,
      current.width,
      current.height
    );
    // console.log(prev.x - WIDTH, next.x + WIDTH, current.x, WIDTH, HEIGHT);
    ctx.restore();
  }

  restore() {
    this.prevImage.restore();
    this.currentImage.restore();
    this.nextImage.restore();
    this.render();
  }

  // endregion

  // region API
  mount(el: HTMLElement) {
    if (el.children.length) throw "el should not contain any child!";
    const { clientWidth: width, clientHeight: height } = el;
    this.$store.commit("SET_WIDTH", width);
    this.$store.commit("SET_HEIGHT", height);
    this.$canvas.style.cssText = `width:${width}px;height:${height}px`;
    this.$canvas.width = width * this.dpr;
    this.$canvas.height = height * this.dpr;
    el.appendChild(this.$canvas);
  }

  showFrom(img: HTMLImageElement) {}

  async stay(direction: number) {
    const current = this.currentImage,
      sibling = direction > 0 ? this.nextImage : this.prevImage;
    current.startAnimation(0);
    sibling.startAnimation(0);
    while ((current.nextFrame(), sibling.nextFrame())) {
      await utils.frame();
      this.render();
    }
    this.restore();
  }

  async next() {
    console.log("next image");
    const current = this.currentImage,
      sibling = this.nextImage;
    current.startAnimation(1);
    sibling.startAnimation(1);
    while ((current.nextFrame(), sibling.nextFrame())) {
      await utils.frame();
      this.render();
    }
    this.currentImageUrl = this.urlRing.getNextBy(this.currentImageUrl);
    this.restore();
  }

  async prev() {
    console.log("prev image");
    const current = this.currentImage,
      sibling = this.prevImage;
    current.startAnimation(-1);
    sibling.startAnimation(-1);
    while ((current.nextFrame(), sibling.nextFrame())) {
      await utils.frame();
      this.render();
    }
    this.currentImageUrl = this.urlRing.getPrevBy(this.currentImageUrl);
    this.restore();
  }

  zoomOn(position: Point) {}

  // endregion
}
