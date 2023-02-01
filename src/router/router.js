import { createRouter, createWebHistory } from "vue-router";
import maps from "@/components/maps/maps.js";

let router = createRouter({
  history: createWebHistory(),
  routes: [{ path: "/", redirect: "/mirage" }],
  linkActiveClass: "mapLink-active",
});

maps.forEach((mapComponent) => {
  router.addRoute({
    name: `/${mapComponent.name}`,
    path: `/${mapComponent.name}`,
    component: mapComponent,
    meta: { mapId: mapComponent.mapId },
  });
});

export default router;
