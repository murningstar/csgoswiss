import { onMounted, ref, watch, type Ref, computed } from "vue";
import type {
    NadeType,
    Side,
    Tickrate,
    Difficulty,
    ForWhom,
} from "@/data/types/GrenadeProperties";
import { nadeTypeList } from "@/data/nadeTypeList";
import type { LineupsHashMap } from "@/data/types/LineupsHashMap";

export function useFilter(
    // unfilteredLineups: Ref<LineupsHashMap>
    ) {
    /* Visibility of FilterPanel.vue */
    const isFiltersVisible = ref(false);
    const toggleFilters = () =>
        (isFiltersVisible.value = !isFiltersVisible.value);

    /* Props for FilterPanel.vue | Extracted for code organization*/
    const filtersPropData = ref({
        nadeTypeList: nadeTypeList,
    });

    /* State of filter */
    const filterState = ref({
        nadeType: "smoke" as NadeType | "all",
        side: "t" as Side,
        tickrate: 128 as Tickrate,
        difficulties: new Set([
            "easy",
            "medium",
            "hard",
            "pixelPerfect",
        ]) as Set<Difficulty>,
        onewaySmokeOption: "All",
        fakeSmokeOption: "All",
        bugSmokeOption: "All",
        forWhom: "yourself" as ForWhom,
        onewayMolotovOption: "All",
        fakeMolotovOption: "All",
        bugMolotovOption: "All",
        bugHeOption: "All",
    });

    /* Persist filterState to LocalStorage */
    watch(filterState, (newVal) => {
        const stringified = JSON.stringify(newVal, (key, value) => {
            return key == "difficulties" ? Array.from(value) : value;
        });
        localStorage.setItem("filterState", stringified);
    });

    /* Init filterstate from LocalStorage */
    function initFilterStateFromLocalStorage() {
        const storedFilter = localStorage.getItem("filterState");
        if (storedFilter) {
            const parsed = JSON.parse(
                localStorage.getItem("filterState")!,
                (k, v) => {
                    return k == "difficulties" ? new Set(v) : v;
                },
            );
            Object.assign(filterState.value, parsed);
        }
    }
    /* Init filterstate from LocalStorage */
    onMounted(initFilterStateFromLocalStorage);

    /* Filter lineups based on filterState */
    // const filteredLineups = computed(() => {
    //     return new Map(
    //         [...unfilteredLineups.value].filter(([lineupId, lineup], ix) => {

    //         }),
    //     );
    // });

    /* Mutations */
    const filterHandlers = {
        changeNadeType: (newVal: any) => {
            filterState.value.nadeType = newVal;
        },
        changeSide: (newVal: any) => {
            filterState.value.side = newVal;
        },
        changeTickrate: (newVal: any) => {
            filterState.value.tickrate = newVal;
        },
        changeDifficulty: (option: Difficulty, newVal: any) => {
            if (newVal === true) {
                filterState.value.difficulties.add(option);
            } else {
                filterState.value.difficulties.delete(option);
            }
            console.log("difficulty modelValue SINGLEMAP: ", newVal);
        },
        // changeDifficulty: (newVal: any, option: string) => {
        // 	filterState.value.difficultiesState[`${option}Visible` as keyof typeof filterState.value.difficultiesState] = newVal
        // 	console.log(filterState.value.difficultiesState[`${option}Visible` as keyof typeof filterState.value.difficultiesState]);
        // },
        changeOnewaySmoke: (newVal: any) => {
            filterState.value.onewaySmokeOption = newVal;
        },
        changeFakeSmoke: (newVal: any) => {
            filterState.value.fakeSmokeOption = newVal;
        },
        changeBugSmoke: (newVal: any) => {
            filterState.value.bugSmokeOption = newVal;
        },
        changeForWhom: (newVal: any) => {
            filterState.value.forWhom = newVal;
        },
        changeOnewayMolotov: (newVal: any) => {
            filterState.value.onewayMolotovOption = newVal;
        },
        changeFakeMolotov: (newVal: any) => {
            filterState.value.fakeMolotovOption = newVal;
        },
        changeBugMolotov: (newVal: any) => {
            filterState.value.bugMolotovOption = newVal;
        },
        changeBugHe: (newVal: any) => {
            filterState.value.bugHeOption = newVal;
        },
    };

    return {
        filterState,
        filterHandlers,
        isFiltersVisible,
        toggleFilters,
        filtersPropData,
    };
}
