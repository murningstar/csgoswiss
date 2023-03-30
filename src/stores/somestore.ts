import { defineStore } from "pinia";
import type { Grenade } from "@/data/interfaces/Grenade";
import type { ThrowSpot } from "@/data/interfaces/ThrowSpot";
import type { Spot } from "@/data/v2_spotSvyaz/Spot";
import type { Lineup } from "@/data/v2_spotSvyaz/Lineup";
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
                selectedSpots: ThrowSpot[];
            }
        >,
        activeToSpots: new Map() as Map<
            Spot["spotId"],
            {
                toSpot: Spot;
                lineupIds: Lineup["lineupId"][];
                hslColor: string;
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
