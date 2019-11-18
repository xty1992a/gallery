import Gallery from "./core/index";

const gallery = new Gallery({
  images: [
    "./static/field.jpg",
    "./static/geralt_of_rivia.jpg",
    "./static/fuji.jpg"
  ],
  current: "./static/field.jpg",
  imageFit: "cover"
});

const el = document.createElement("div");
el.style.cssText = "width:600px;height:375px;border: 1px solid";
document.body.appendChild(el);

gallery.mount(el);

console.log(gallery);
