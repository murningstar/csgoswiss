import { createRouter, createWebHistory } from "vue-router";
import mapsComponentsExport from "@/components/maps/mapsComponentsExport.js";

let router = createRouter({
  history: createWebHistory(),
  routes: [{ path: "/", redirect: "/mirage" }],
  linkActiveClass: "mapLink-active",
});

mapsComponentsExport.forEach((mapComponent) => {
	router.addRoute({
		name: `/${mapComponent.name}`,
		path: `/${mapComponent.name}`,
		component: mapComponent,
		meta: { mapId: mapComponent.mapId },
	});
});

export default router;
