import { createApp } from "vue";
import { createPinia } from "pinia";
import "./style.css";
import App from "./App.vue";
import router from "@/router/router.js";

import Navbar from "@/components/Navbar/Navbar.vue";
import Maps from "@/components/Maps/Maps.vue"
import loadingWindow from "@/components/Loading_goldsource/Loading_goldsource.vue";
import SingleMap from "@/components/SingleMap/SingleMap.vue";
import CMS from "@/components/cms/CMS.vue";

const components = [Navbar, Maps, loadingWindow, SingleMap, CMS]

let app = createApp(App);
app.use(router);
app.use(createPinia())

components.forEach((component) => {
	console.log(component.__name);
	app.component(component.__name, component)
});

app.mount("#app");
