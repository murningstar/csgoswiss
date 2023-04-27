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

        // activeGrenadeItems: new Map() as Map<
        //     Grenade["id"], // string
        //     {
        //         grenade: Grenade;
        //         colorStr: string;
        //         selectedSpots: ThrowSpot[];
        //     }
        // >,

        toggledToSpots: new Map() as Map<
            Spot["spotId"],
            {
                toSpot: Spot;
                lineupIds: Lineup["lineupId"][];
                avgDuration: string;
                hslColor: string;
                isActive: boolean;
                isSelected: boolean;
            }
        >,
        /* selectedToSpots необходим для того чтобы при нажатии на fromSpot соответствующий
        лайнап делался выбранным (то есть засунутым в selectedLineups). Если делать без
        selectedToSpots, а просто добавлять лайнап в selectedLineups, то если я хочу, чтобы
        все остальные лайнапы выключались при выборе одного конкретного, это нельзя будет 
        сделать никак. Т.к. activeLineup это computed на основе activeToSpots и мне пришлось
        бы убрать выбранный лайнап из activeLineup и поместить его в selectedLineup, 
        что невозможно(еще раз, потому что activeLineup это computed).
        Поэтому при выборе(selectedLineups) лайнапа, я просто убираю соответствующий ToSpot
        из activeToSpots, добавляю этот ToSpot в selectedToSpots и помещаю в него id
        выбранного лайнапа
         */ /* Возможно, как-то можно было этого избежать, например, добавлять свойства
         activeLineupIds и selectedLineupIds прямо в activeToSpots(и как-то убирать лайнап,
            который есть в selectedLineupIds из activeLineupIds. Мб это как-то можно сделать с
            помощью вычисляемых(не путать с vue-computed) свойств js-объектов). Но я
            слишком зеленый для всего этого пока что. */

        /* Мысль на будущее */
        selectedToSpots: new Map() as Map<
            Spot["spotId"],
            {
                toSpot: Spot;
                lineupIds: Lineup["lineupId"][];
                avgDuration: string;
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
