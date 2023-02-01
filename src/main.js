import { createApp } from "vue";
import "./style.css";
import App_composition from "./App_composition.vue";
import components from "@/components/components.js";
import router from "@/router/router.js";

let app = createApp(App_composition);
components.forEach((component) => {
	app.component(component.name, component);
});

app.use(router);

app.mount("#app");
