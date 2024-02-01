import panzoom from "panzoom";

export const vPanzoom = {
    mounted(el: HTMLElement) {
        panzoom(el, {
            maxZoom: 3,
            minZoom: 1,
            bounds: true,
            zoomDoubleClickSpeed: 1,
        });
    },
};
