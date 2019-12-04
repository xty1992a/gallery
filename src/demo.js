import Gallery from "./core/index";
import Tween from "./helpers/tween";

const gallery = (window.gallery = new Gallery({
  // devicePixelRatio: 1,
  images: [
    /*	"./static/field.jpg",
		"./static/geralt_of_rivia.jpg",
		"./static/fuji.jpg"*/
    ...Array(10)
      .fill(0)
      .map((n, i) => `./static/${i + 1}.jpg`)
  ],
  // animationDuration: 160,
  // animationEasing: Tween.Back.easeIn,
  imageFit: "contain"
}));

const el = document.createElement("div");
el.style.cssText = "width:600px;height:375px;border: 1px solid";
const panel = document.createElement("div");
panel.style.cssText = `width:600px;display:flex;justify-content:space-between;padding:10px 20px;box-sizing:border-box;`;
panel.innerHTML = `
<button id="prev">PREV</button>
<button id="next">NEXT</button>
`;
document.body.appendChild(el);
document.body.appendChild(panel);
const $ = s => document.querySelector(s);

$("#prev").addEventListener("click", function() {
  gallery.prev();
});
$("#next").addEventListener("click", function() {
  gallery.next();
});

gallery.mount(el);

console.log(gallery);
