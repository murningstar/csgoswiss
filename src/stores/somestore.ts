import { defineStore } from "pinia";
export const useSomestore = defineStore("somestore", {
    state: () => ({
        isFirstLoad: true,
        isCmsModeOn: false,
    }),
    getters: {},
    actions: {
        isFirstLoadTrue() {
            this.isFirstLoad = false;
        },
        toggleCmsMode(){
            this.isCmsModeOn = !this.isCmsModeOn
        }
    },
});
