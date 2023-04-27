import { createRouter, createWebHistory } from "vue-router";
import SingleMap from '@/components/SingleMap/SingleMap.vue'

let router = createRouter({
	history: createWebHistory(),
	routes: [
		{ path: "/", redirect: "/mirage" },
		{ path: "/:map", component:SingleMap}
		// { path: "/ancient", name: "ancient" },
		// { path: "/dust2", name: "dust2" },
		// { path: "/inferno", name: "inferno" },
		// { path: "/mirage", name: "mirage" },
		// { path: "/nuke", name: "nuke" },
		// { path: "/overpass", name: "overpass" },
		// { path: "/train", name: "train" },
		// { path: "/vertigo", name: "vertigo" },
	],
	linkActiveClass: "mapLink-active",
});

export default router;
