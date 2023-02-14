import { createRouter, createWebHistory } from "vue-router";

let router = createRouter({
	history: createWebHistory(),
	routes: [
		{ path: "/", redirect: "/mirage" },
		{ path: "/:map"}
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
