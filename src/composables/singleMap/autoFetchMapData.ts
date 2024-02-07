/* Все эти импорты и парсы js-файлов нахуеверчены
чтобы челики не смогли ctrl+c ctrl+v из json файла*/

import { computed, ref, watch, watchEffect } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import type { Spot } from "@/data/interfaces/Spot";
import type { Lineup } from "@/data/interfaces/Lineup";
import type { SpotsHashMap } from "@/data/types/SpotsHashMap";
import type { LineupsHashMap } from "@/data/types/LineupsHashMap";

function prepareForEval(fileContents: string) {
    const startIndex = fileContents.indexOf("new");
    const endIndex = fileContents.split("//#")[0].lastIndexOf(";") + 1;
    const satinized = fileContents.slice(startIndex, endIndex);
    return satinized;
}

async function fetchSpotsOrLineups(
    type: "spots" | "lineups",
    mapName: string,
    controller: AbortController,
) {
    console.log(`fetch for ${mapName} ${type}`);
    return await axios.get<string>(
        `/src/data/content/${mapName}/${type}_${mapName}`,
        {
            signal: controller.signal,
        },
    );
}

export function useAutoFetchMapData() {
    const spots = ref<SpotsHashMap>(new Map());
    const lineups = ref<LineupsHashMap>(new Map());
    const error = ref(null);
    const loading = ref(false);
    const route = useRoute();
    const currentRoute = computed(() => route.path.slice(1));
    const previousAbort = ref<Function | null>(null);

    function populate() {
        spots.value = new Map();
        lineups.value = new Map();
        error.value = null;
        loading.value = true;
        const controller = new AbortController();
        Promise.all([
            fetchSpotsOrLineups("spots", currentRoute.value, controller),
            fetchSpotsOrLineups("lineups", currentRoute.value, controller),
        ])
            .then((res) => {
                spots.value = eval(prepareForEval(res[0].data));
                lineups.value = eval(prepareForEval(res[1].data));
            })
            .catch((e) => {
                error.value = e.message;
                console.log(error.value);
            })
            .finally(() => {
                loading.value = false;
            });
        return function abort() {
            controller.abort();
        };
    }

    watch(
        () => route.path,
        () => {
            if (previousAbort.value) previousAbort.value();
            previousAbort.value = populate();
        },
        { immediate: true },
        // c immediate:true данные загрузятся при первой загрузке
        // иначе только при смене маршрута
    );

    return { spots, lineups, loading, error };
}
