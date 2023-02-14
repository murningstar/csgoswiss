import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "@/router/router.js";

import Navbar from "@/components/Navbar.vue";
import Maps from "@/components/Maps.vue"
import loadingWindow from "@/components/Loading_goldsource.vue";
import SingleMap from "@/components/SingleMap.vue";

const components = [Navbar, Maps, loadingWindow, SingleMap];

let app = createApp(App);
app.use(router);

components.forEach((component) => {
	app.component(component.__name, component)
});

app.mount("#app");
