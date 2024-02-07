import type { LineupItemsHashMap } from "@/data/types/LineupItemsHashMap";
import type { LineupsHashMap } from "@/data/types/LineupsHashMap";
import type { SpotsHashMap } from "@/data/types/SpotsHashMap";
import type { ViewFromSpotsHashMap } from "@/data/types/ViewFromSpotsHashMap";
import { ViewItemsFactory } from "@/data/types/ViewItems";
import type { ViewToSpotsHashMap } from "@/data/types/ViewToSpotsHashMap";
import { ref, watch, type Ref, reactive } from "vue";

export function useViewItems(
    spots: Ref<SpotsHashMap>,
    lineups: Ref<LineupsHashMap>,
) {
    const viewToSpots = reactive<ViewToSpotsHashMap>({ value: new Map() }); // Инициализируется в начале
    const viewLineups = reactive<LineupItemsHashMap>({ value: new Map() }); // Создаются на клик по viewToSpot'у
    const viewFromSpots = reactive<ViewFromSpotsHashMap>({ value: new Map() }); // Создаются на клик по viewToSpot'у
    let viewItemsFactory;
    watch(lineups, () => {
        /* Reset ViewItems */
        viewToSpots.value.clear();
        viewLineups.value.clear();
        viewFromSpots.value.clear();
        /* (Re)Initialize Factory */
        viewItemsFactory = new ViewItemsFactory(
            spots.value,
            lineups.value,
            viewToSpots,
            viewLineups,
            viewFromSpots,
        );
        /* (Re)initialize ViewToSpots */
        viewToSpots.value = viewItemsFactory.createViewToSpots().value;
    });
    

    return { viewItemsFactory, viewToSpots, viewLineups, viewFromSpots };
}
