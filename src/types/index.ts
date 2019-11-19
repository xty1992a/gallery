export interface GalleryProps {
  images: string[];
  current: string;
  imageFit?: string;
  autoplay?: boolean;
  duration?: number;
  loop?: boolean;
  zoomable?: boolean;
  touchable?: boolean;
  doubleClickZoom?: boolean;
  width?: number;
  height?: number;
  devicePixelRatio?: number;
  animationDuration?: number;
  animationEasing?: TweenFn;
}

export type AnyObj = {
  [prop: string]: any;
};

export type Point = {
  x: number;
  y: number;
  [prop: string]: any;
};

export default interface IGallery {
  mount: (el: HTMLElement) => void; // 挂在某个元素上展示
  showFrom: (img: HTMLImageElement, mountEl?: HTMLElement) => void; // 自某个元素放大至全屏预览
  next: () => void; // 显示下一张
  prev: () => void;
  zoomOn: (position: Point) => void; // 以一个坐标为原点,放大元素
}
