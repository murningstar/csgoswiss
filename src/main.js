import { createApp } from "vue";
import "./style.css";
import App_composition from "./App_composition.vue";
import router from "@/router/router.js";

import MapsNav from "@/components/MapsNav.vue";
import Maps from "@/components/Maps.vue";
import loadingWindow from "@/components/loadingWindow.vue";
import SingleMap from "@/components/SingleMap.vue";

const components = [MapsNav, Maps, loadingWindow, SingleMap];

let app = createApp(App_composition);
app.use(router);

components.forEach((component) => {
	app.component(component.name || component.__name, component);
});

app.mount("#app");
