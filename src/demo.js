import Gallery from "./core/index";

const gallery = (window.gallery = new Gallery({
  images: [
    /*	"./static/field.jpg",
		"./static/geralt_of_rivia.jpg",
		"./static/fuji.jpg"*/
    ...Array(10)
      .fill(0)
      .map((n, i) => `./static/${i + 1}.jpg`)
  ]
}));

const el = document.createElement("div");
el.style.cssText = "width:600px;height:375px;border: 1px solid";
document.body.appendChild(el);

gallery.mount(el);

console.log(gallery);
