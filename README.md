# 一个基于 canvas 的画廊插件

## 介绍

插件支持无限轮播以及缩放预览.因为基于 canvas,不存在实际的 dom,因此理论上支持展示无限多的图片.

## 使用

1. 引入
   `import Gallery from "to/path/gallery.js"`
2. 实例化

```javascript
const gallery = new Gallery({
  images: [
    "./static/field.jpg",
    "./static/geralt_of_rivia.jpg",
    "./static/fuji.jpg"
  ]
});

gallery.mount(dom); // mount an empty HTMLElement
```

3. API
   1. `next`,使画廊展示下一张图片<返回 promise>
   1. `prev`,使画廊展示上一张图片<返回 promise>
   1. `restore`,使画廊恢复初始位置/尺寸

## 配置对象

|            属性名 |     类型 |    默认值 |                   描述 |
| ----------------: | -------: | --------: | ---------------------: |
|            images | string[] | undefined | 需要展示的图片路径数组 |
|           current |   string | images[0] |         当前展示的图片 |
|          imageFit |   string |   'cover' |           如何布局图片 |
|          autoplay |  boolean |      true |           是否自动轮播 |
|          duration |   number |      1000 |       自动轮播间隔时间 |
|              loop |  boolean |      true |       是否可以无线轮播 |
|          zoomable |  boolean |      true |           是否可以缩放 |
|         touchable |  boolean |      true |       是否可以手指缩放 |
|   doubleClickZoom |  boolean |      true |       是否可以双击缩放 |
| animationDuration |  boolean |      true |       是否可以双击缩放 |
