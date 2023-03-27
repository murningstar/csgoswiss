import { defineStore } from "pinia";
import type { Grenade } from "@/data/interfaces/Grenade";
import type { ThrowSpot } from "@/data/interfaces/ThrowSpot";
export const useSomestore = defineStore("somestore", {
    state: () => ({
        isFirstLoad: true,
        isCmsModeOn: false,
        /* activeGrenades пуржится в компоненте Navbar перед переходом на другой роут */
        activeGrenadeItems: new Map() as Map<
            Grenade["id"], // string
            {
                grenade: Grenade;
                colorStr: string;
                selectedSpots:ThrowSpot[]
            }
        >,
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
