import { createRouter, createWebHistory } from "vue-router";

let router = createRouter({
  history: createWebHistory(),
  routes: [{ path: "/", redirect: "/mirage" }],
  linkActiveClass: "mapLink-active",
});

export default router;
