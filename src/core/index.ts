import IGallery, { GalleryProps, Point } from "../types/index";
import store from "./store";
import Store from "../helpers/store";
import { EmitAble } from "../helpers/utils";
import EventsManager from "./events-manager";
import { AnyObj } from "../types/index";

const dftOptions = {
  autoplay: true,
  duration: 1500,
  loop: true,
  zoomable: true,
  touchable: true,
  doubleClickZoom: true,
  devicePixelRatio: window.devicePixelRatio || 1
};

export default class Gallery extends EmitAble implements IGallery {
  //region property types
  $canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  $eventsManger: EventsManager;
  $store: Store;
  $options: AnyObj;
  dpr: number;
  WIDTH: number;
  HEIGHT: number;

  //endregion
  constructor(props: GalleryProps) {
    super();
    if (!props) throw "expect props";
    this.handlerStore({ ...dftOptions, ...props });
    this.handlerDOM();
    this.handlerEvents();
  }

  // region DOM相关
  handlerDOM() {
    const canvas = (this.$canvas = document.createElement("canvas"));
    this.ctx = canvas.getContext("2d");
  }

  handlerEvents() {
    const options = {
      el: this.$canvas
    };
    const events = (this.$eventsManger = new EventsManager(options));

    events.on("point-down", e => {
      console.log("point down", e);
    });
    events.on("point-move", e => {
      console.log("point move", e);
    });
    events.on("zoom", e => {
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
    this.$store.mapGetters(["dpr"]).call(this);
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

  next() {}

  prev() {}

  zoomOn(position: Point) {}

  // endregion
}
