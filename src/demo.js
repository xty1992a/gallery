import Gallery from "./core/index";

const gallery = new Gallery({
  images: ["./static/field.jpg", "./static/geralt_of_rivia.jpg"]
});

const el = document.createElement("div");
el.style.cssText = "width:600px;height:400px;border: 1px solid";
document.body.appendChild(el);

gallery.mount(el);
