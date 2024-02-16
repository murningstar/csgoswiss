import { defineStore } from "pinia";
export const useSomestore = defineStore("somestore", {
    state: () => ({
        isFirstLoad: true,
        isCmsModeOn: false,
        isDebugModeOn: true
    }),
    getters: {},
    actions: {
        isFirstLoadToFalse() {
            this.isFirstLoad = false;
        },
        toggleCmsMode() {
            this.isCmsModeOn = !this.isCmsModeOn;
        },
    },
});
