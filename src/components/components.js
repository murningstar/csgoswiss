import MapsNav from "./MapsNav.vue";
import Maps from "@/components/Maps.vue";
import loadingWindow from "@/components/loadingWindow.vue";
// import mapsComponents from './maps/maps.js'

let components = [];
components.push(MapsNav, Maps, loadingWindow);
// components.concat(mapsComponents, )

export default components;
