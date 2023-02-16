import { defineStore } from "pinia";
export const useSomestore = defineStore("somestore", {
    state: () => ({
        isFirstLoad: true,
    }),
    getters: {},
    actions: {
        isFirstLoadTrue() {
            this.isFirstLoad = false;
        },
    },
});
