import { ViewItemsFactory } from "@/data/types/ViewItems";
import type { SpotsHashMap } from "@/data/types/SpotsHashMap";
import type { LineupsHashMap } from "@/data/types/LineupsHashMap";
import type { ViewLandSpotsHashMap } from "@/data/types/ViewLandSpotsHashMap";
import type { ViewLinesHashMap } from "@/data/types/ViewLinesHashMap";
import type { ViewThrowSpotsHashMap } from "@/data/types/ViewThrowSpotsHashMap";
import { ref, watch, type Ref, reactive } from "vue";

export function useViewItems(
    spots: Ref<SpotsHashMap>,
    lineups: Ref<LineupsHashMap>,
) {
    const viewLandSpots = reactive<ViewLandSpotsHashMap>({ value: new Map() }); // Инициализируется в начале
    const viewLines = reactive<ViewLinesHashMap>({ value: new Map() }); // Создаются на клик по viewThrowSpot'у
    const viewThrowSpots = reactive<ViewThrowSpotsHashMap>({
        value: new Map(),
    }); // Создаются на клик по viewThrowSpot'у
    let viewItemsFactory;
    watch(lineups, () => {
        /* Reset ViewItems */
        viewLandSpots.value.clear();
        viewLines.value.clear();
        viewThrowSpots.value.clear();
        /* (Re)Initialize Factory */
        viewItemsFactory = new ViewItemsFactory(
            spots.value,
            lineups.value,
            viewLandSpots,
            viewLines,
            viewThrowSpots,
        );
        /* (Re)initialize ViewLandSpots */
        viewLandSpots.value = viewItemsFactory.createViewLandSpots().value;
    });

    return { viewItemsFactory, viewLandSpots, viewThrowSpots, viewLines };
}
