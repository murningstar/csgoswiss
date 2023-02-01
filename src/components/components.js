import mapsNav from "./mapsNav.vue";
import maps from "@/components/maps.vue";
import loadingWindow from "@/components/loadingWindow.vue";
// import mapsComponents from './maps/maps.js'

let components = [];
components.push(mapsNav, maps, loadingWindow);
// components.concat(mapsComponents, )

export default components;
