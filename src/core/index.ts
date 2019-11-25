import IGallery, { GalleryProps, Point } from "../types/index";
import store from "./store";
import Store from "../helpers/store";
import { EmitAble } from "../helpers/utils";
import EventsManager from "./events-manager";
import ImageModel from "./image-model";
import { AnyObj } from "../types/index";
import Ring from "../helpers/ring";
import * as utils from "../helpers/utils";
import Tween from "../helpers/tween";

const dftOptions = {
  autoplay: true,
  duration: 1500,
  animationDuration: 300,
  animationEasing: Tween.Linear,
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
  protected ctx: CanvasRenderingContext2D;
  protected $eventsManger: EventsManager;
  $store: Store;
  $options: AnyObj;
  currentImageUrl: string;
  dpr: number;
  WIDTH: number;
  HEIGHT: number;
  protected imageModelMap: {
    [prop: string]: ImageModel;
  };
  protected $urlRing: Ring;
  //endregion

  // region 计算属性
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

  get prevImageUrl() {
    return this.$urlRing.getPrevBy(this.currentImageUrl);
  }

  get nextImageUrl() {
    return this.$urlRing.getNextBy(this.currentImageUrl);
  }

  // endregion

  constructor(props: GalleryProps) {
    super();
    if (!props) throw "expect props";
    const options = Gallery.handlerOptions(props);
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
  protected handlerChildren() {
    // 实例化监听器
    this.$eventsManger = new EventsManager({ el: this.$canvas });
    // 实例化环
    this.$urlRing = new Ring(this.$options.images);
    // 初始化imageModel缓存容器
    this.imageModelMap = {};
    // 初始化当前imageModel
    this.currentImageUrl = this.$options.current;
  }

  // endregion

  // region DOM相关
  protected handlerDOM() {
    const canvas = (this.$canvas = document.createElement("canvas"));
    this.ctx = canvas.getContext("2d");
  }

  protected handlerEvents() {
    // 监听事件监听器派发的事件
    const events = this.$eventsManger;
    events.on("point-down", () => {
      if (this.currentImage.onAnimation) return;
      // 各imageModel记录当前位置
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
      // 没有缩放时,为轮播模式
      if (this.currentImage.width === this.currentImage.initialWidth) {
        delta.y = 0;
        this.prevImage.move(delta);
        this.nextImage.move(delta);
      }
      // 否则为预览模式
      this.currentImage.move(delta);
      this.render();
    });
    events.on("point-up", e => {
      console.log("point-up", e);
      if (this.currentImage.onAnimation) return;
      // 缩放时,什么都不做
      if (this.currentImage.zoomDirection < 0) return;
      ["x", "y"].forEach(k => console.log(this.currentImage[k]));
      // 没有缩放时,检查移动方向
      if (this.currentImage.shouldNext()) return this.next();
      if (this.currentImage.shouldPrev()) return this.prev();
      // 移动不足切换,回到原位
      this.stay(e.directionX);
    });
    events.on("zoom", e => {
      this.currentImage.zoom(e.origin, e.direction);
      this.render();
      console.log("zoom", e);
    });
    events.on("db-click", e => {
      // this.currentImage.zoom(e, 1);
      // this.render();
      this.zoomOn(e);
    });
  }

  // endregion

  // region store 相关
  protected handlerStore(options: GalleryProps) {
    this.$store = new Store(store);
    this.commitOptions(options);
    this.mapStore();
  }

  protected commitOptions(options: object) {
    this.$store.commit("SET_OPTIONS", options);
  }

  // 将store中的字段映射到本类中
  protected mapStore() {
    this.$store.mapState({ $options: "options" }).call(this);
    this.$store.mapGetters(["dpr", "WIDTH", "HEIGHT"]).call(this);
  }

  // endregion

  // region 渲染
  protected async render() {
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
    console.log("stay");
    const current = this.currentImage,
      sibling = direction > 0 ? this.nextImage : this.prevImage;
    current.startMove(0);
    sibling.startMove(0);
    // 穷尽imageModel的每一帧
    while (current.nextFrame() && sibling.nextFrame()) {
      await utils.frame();
      this.render();
    }
    this.restore();
  }

  async next() {
    console.log("next image");
    const current = this.currentImage,
      sibling = this.nextImage;
    if (current.onAnimation) return;
    current.startMove(-1);
    sibling.startMove(-1);
    while (current.nextFrame() && sibling.nextFrame()) {
      await utils.frame();
      this.render();
    }
    this.currentImageUrl = this.$urlRing.getNextBy(this.currentImageUrl);
    this.restore();
  }

  async prev() {
    console.log("prev image");
    const current = this.currentImage,
      sibling = this.prevImage;
    if (current.onAnimation) return;
    current.startMove(1);
    sibling.startMove(1);
    while (current.nextFrame() && sibling.nextFrame()) {
      await utils.frame();
      this.render();
    }
    this.currentImageUrl = this.$urlRing.getPrevBy(this.currentImageUrl);
    this.restore();
  }

  async zoomOn(position: Point) {
    const current = this.currentImage;
    if (current.onAnimation) return;
    current.startZoom(position);
    while (current.nextFrame()) {
      await utils.frame();
      this.render();
    }
    this.render();
    console.log(current.width, current.initialWidth, "after zoom");
    current.onAnimation = false;
  }

  // endregion
}
