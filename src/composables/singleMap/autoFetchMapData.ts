/* Все эти импорты и парсы js-файлов нахуеверчены
чтобы челики не смогли ctrl+c ctrl+v из json файла*/

import { computed, ref, watch, watchEffect } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import type { Spot } from "@/data/interfaces/Spot";
import type { Lineup } from "@/data/interfaces/Lineup";

function prepareForEval(fileContents: string) {
    const startIndex = fileContents.indexOf("new");
    const endIndex = fileContents.lastIndexOf(")") + 2;
    return fileContents.slice(startIndex, endIndex);
}

async function fetchSpotsOrLineups(
    type: "spots" | "lineups",
    mapName: string,
    controller: AbortController,
) {
    return await axios.get<string>(
        `/src/data/content/${mapName}/${type}_${mapName}`,
        {
            signal: controller.signal,
        },
    );
}

export function useAutoFetchMapData() {
    const spots = ref<Map<Spot["spotId"], Spot>>(new Map());
    const lineups = ref<Map<Lineup["lineupId"], Lineup>>(new Map());
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
                lineups.value = eval(prepareForEval(res[0].data));
                spots.value = eval(prepareForEval(res[1].data));
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

    // watchEffect((onCleanup) => {
    //     const abort = populate();
    //     onCleanup(() => abort());
    // });
    watch(
        () => route.path,
        () => {
            if (previousAbort.value) previousAbort.value();
            previousAbort.value = populate();
        },
    );

    return { spots, lineups, loading, error };
}
