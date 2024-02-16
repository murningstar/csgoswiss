<script lang="ts" setup>
// Vue imports
import { ref, computed, watch, onMounted, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSomestore } from "@/stores/somestore";

// Libraries
import { gsap } from "gsap";
import { random } from "nanoid";
import { createMachine } from "xstate";

// components
import SmokeComponent from "@/components/SingleMap/Smoke.vue";
import MolotovComponent from "@/components/SingleMap/Molotov.vue";
import FlashComponent from "@/components/SingleMap/Flash.vue";
import HeComponent from "@/components/SingleMap/He.vue";
import ThrowSpot from "@/components/SingleMap/ThrowSpot.vue";
import CMS from "@/components/cms/CMS.vue";
import FilterPanel from "@/components/SingleMap/FilterPanel.vue";
import LandSpot from "@/components/SingleMap/LandSpot.vue";
import LineupLine from "./LineupLine.vue";
import PreviewPanel from "@/components/SingleMap/PreviewPanel.vue";
import PreviewCard from "@/components/SingleMap/PreviewCard.vue";
import ContentPanel from "@/components/SingleMap/ContentPanel.vue";
import GS_Window from "@/components/UI/GS_Window.vue";
import LoadingGoldsource from "@/components/loadingGoldsource/LoadingGoldsource.vue";

// composables
import { useLoadingGoldsource } from "@/composables/loadingGoldsource";
import { useAutoFetchMapData } from "@/composables/singleMap/autoFetchMapData"; // fetch lineups & spots data + autorefetch on route.path change
import { useViewItems } from "@/composables/singleMap/useViewItems";
import { useFilter } from "@/composables/singleMap/filter";
// directives
import { vPanzoom } from "@/directives/vPanzoom";

// other
import { mapNamesList } from "@/data/mapNamesList";
import { nadeTypeList } from "@/data/nadeTypeList";

import type { MapItems } from "@/data/types/MapItems";
import type { Smoke as SmokeType } from "@/data/_old/Smoke";
// import type { Grenade } from "@/data/interfaces/Grenade";
import type { Spot } from "@/data/interfaces/Spot";
import { ViewItemsFactory, type LineupItem } from "@/data/types/ViewItems";
import type { ViewThrowSpot, ViewLandSpot } from "@/data/types/ViewItems";
import SelectFormOnClickThrowSpot from "./SelectFormOnClickThrowSpot.vue";

/* Global stuff */
const store = useSomestore();
const router = useRouter();
const route = useRoute();
const currentRoute = computed(() => route.path.slice(1));
const isDragging = ref(false);

/* Autorefetchable lineup & spots data on route change */
const { lineups, spots } = useAutoFetchMapData();
const {
    viewItemsFactory,
    viewThrowSpots,
    viewLines,
    viewLandSpots,
    selectFormThrowSpotContext,
} = useViewItems(spots, lineups);

/* Loading window Bindings */
const {
    isLoading,
    nSegmentsVisible,
    startLoading,
    endLoading,
    onImageLoadError,
} = useLoadingGoldsource();
watch(
    // открывает окно загрузки когда путь изменился
    () => route.path,
    (newPath, oldPath) => {
        /* если убрать условие, то всё все равно будет работать, а именно
	- при клике на ту же карту, startloading не сработает,
	- при клике на другую карту startloading сработает.
	Почему так, хз его знает, проверку оставил на всякий случай */
        if (newPath != oldPath) {
            startLoading();
        }
    },
);

/* Filters & FilterPanel bindings */
const {
    filterState,
    filterHandlers,
    isFiltersVisible,
    toggleFilters,
    filtersPropData,
} = useFilter();

/* IMAGE STUFF */
const imgRef = ref(null);
const smokeSpritesRef = ref([]);
const outerContainerRef = ref<HTMLDivElement | null>(null);
const pointSize = ref(0);
const pxCoef = 0.0016155; // пропорция 1px к размеру карты
/* alt attribute for images of maps */
const imgMapError = computed(() => {
    if (mapNamesList.includes(currentRoute.value)) {
        return `de_${currentRoute.value} map top view`;
    } else {
        return `There isn't such map in active pool, please choose another map`;
    }
});
/* onload обработчик для картинок карт (наприм. mirage.wepb) */
function onImageLoaded(event: Event) {
    const getElemSide = (elem: HTMLImageElement) => {
        return elem.getBoundingClientRect().height;
    };
    endLoading();
    /* ПОСЧИТАТЬ РАЗМЕР ТОЧКИ ПРИ ЗАГРУЗКЕ КАРТЫ */
    if (store.isFirstLoad) {
        /* Условие нужно, чтобы ресайз не происходил при зуме и переходе на другой роут */
        const mapside = getElemSide(event.target as HTMLImageElement);
        const mapCoefd = mapside * pxCoef;
        if (mapside > 450) {
            pointSize.value = Math.ceil(mapCoefd * 10); // 10px это по дефолту(пересчитываю этот размер для ресайза)
        } else {
            pointSize.value = Math.ceil(mapCoefd * 10); // 10px это по дефолту(пересчитываю этот размер для ресайза)
            // pointSize.value = Math.ceil(mapCoefd) * 10
            // Карта 619x619, точка 10x10, коэф 619/10 = 61.9
        }
        store.isFirstLoadToFalse();
    }
    /* Запуск анимаций вращений смоков.
	Применяются здесь, т.к. иначе при загрузке пикчи карты происходит 
	какая-то подкапотная поебень, связанная с множественными транслэйтами 
	и сдвигающая картинки смока, если на них применены будь то CSS анимации 
	или GSAP анимации. */
    smokeSpritesRef.value.forEach((sprite) => {
        gsap.to(sprite.spriteRef, {
            rotate: 360,
            duration: 20,
            repeat: -1,
            ease: "linear",
        });
    });
}
/* ИЗМЕНИТЬ РАЗМЕР ТОЧКИ НА РЕСАЙЗЕ (применяется в onMounted чуть ниже) */
const imgResizeObs = new ResizeObserver((obsedElements) => {
    if (!store.isFirstLoad) {
        const mapside = obsedElements[0].contentRect.height;
        const mapCoefd = mapside * pxCoef;
        if (mapside > 450) {
            pointSize.value = Math.ceil(mapCoefd * 10); // 10px это по дефолту(пересчитываю этот размер для ресайза)
        } else {
            pointSize.value = Math.ceil(mapCoefd * 10); // 10px это по дефолту(пересчитываю этот размер для ресайза)
            // pointSize.value = Math.ceil(mapCoefd) * 10
            // Карта 619x619, точка 10x10, коэф 619/10 = 61.9
        }
    }
});
/* Функция для подгрузки изображений других карт */
async function preloadRestData() {
    /* Можно спокойно подгружать все карты и пикча текущей карты
    загружена не будет, т.к. браузер увидит, что она есть в кэше => 
    функционал для отслеживания уже загруженных карт не нужен */
    mapNamesList.forEach((map) => {
        let img = new Image();
        img.src = `/src/assets/maps/webp/${map}.webp`;
    });
}
/* preloadRestData(), resizeObserver.observe() */
onMounted(() => {
    preloadRestData();
    imgResizeObs.observe(imgRef.value!);
});

/* PreviewPanel stuff */
const previewPanelState = ref({
    isToggled: false,
    isMinimized: false,
    isActive: computed(() => selectedLineups.value.length > 0),
});
const previewPanelHandlers = {
    togglePreviewPanel: () => {
        previewPanelState.value.isToggled = !previewPanelState.value.isToggled;
    },
    toggleMinimize: () => {
        previewPanelState.value.isMinimized =
            !previewPanelState.value.isMinimized;
        window.localStorage.setItem(
            "previewPanelState.isMinimized",
            JSON.stringify(previewPanelState.value.isMinimized),
        );
    },
};
/* init PreviewPanel's `minimized` from localStorage */
onMounted(() => {
    if (window.localStorage.getItem("previewPanelState.isMinimized") !== null) {
        previewPanelState.value.isMinimized = JSON.parse(
            window.localStorage.getItem("previewPanelState.isMinimized")!,
        );
    }
});

/* TOSPOT ПОКАЗЫВАЕТСЯ, ЕСЛИ ПОДХОДИТ ПО ФИЛЬРАМ **ХОТЯ БЫ ОДИН** СВЯЗАННЫЙ С НИМИ ЛАЙНАП
(А ЛАЙНАПОВ СВЯЗАННЫХ С НИМ - НЕСКОЛЬКО)
ТО ЕСТЬ ОТОБРАЖЕНИЕ **КОНКРЕТНОГО** ЛАЙНАПА НЕ МОЖЕТ БЫТЬ СВЯЗАНО С ОТОБРАЖЕНИЕМ toСПОТА.
То есть то что сам toSpot подходит по фильтрам не значит, что все связанные с ним лайнапы
подходят по фильтрам. Это значит, что вне зависимости от фильтров будут отрисованы все связанные 
toSpotы.
Поэтому сами лайнапы тоже необходимо фильтровать. Попробовать сделать это можно двумя способами:
1) Отрисовать все лайнапы и включать только подходящие по фильтру с помощью v-if/v-show
2) Добавлять в toSpot ...  */

/* VIEW-TOSPOTS2 */
/* В один спот может прилетать несколько разных лайнапов. Информацию о каждом
нужно хранить в этом споте для условной отрисовки на основе фильтров
---
На 1 лайнап делать 1 спот - нельзя, т.к. споты будут наслаиваться на миникарте, если
у 2 и более лайнапов один и тот же toSpot.
---
По сути viewToSpots содержит в себе все возможные точки, куда летят гранаты.
В template нужно только показать нужные на основе фильтров  */
// const viewToSpots = ref<Map<Spot["spotId"], ViewToSpot>>(new Map());

/* VIEW-LINEUPS */
// const viewLines = ref<Map<Lineup["lineupId"], LineupItem>>(new Map());

/* VIEW-FROMSPOTS */
/* Лайнапов к одному fromСпоту 
может быть несколько, когда включено несколько toСпотов
Или когда редкий эдж кейс, когда уже выбрана граната, такая как на мираже смок в окно
и к ней выбирается еще молотов с той же позиции также в окно. Кому это может пригодиться?
Мб кто-то будет расставлять экзеки на карте и кому-то понадобится такой функционал. */
// const viewFromSpots = ref<Map<Spot["spotId"], ViewFromSpot>>(new Map());

// const selectedLineups = computed(() => {
//     const res = [...viewLines.value]
//         .filter((lineup) => lineup[1].isSelected)
//         .map((lineup) => lineup[1].lineup);
//     if (!store.isFirstLoad) {
//         const ids = res.map((lineup) => lineup.lineupId);
//         const into = res.map((lineup) => lineup.name.replace("into-", ""));
//         if (res.length > 0) {
//             /* Names into url */
//             router.push({ query: { into: into } });
//             /* IDs into localstorage */
//             // localStorage.setItem('where', JSON.stringify(ids))
//         } else {
//             router.push({ query: {} });
//             // localStorage.removeItem('where')
//         }
//     }

//     return res;
// });

/* Если в URL есть lineup'ы, то сделать их выбранными */
// onMounted(() => {
//     if (route.query.into) {
//         router.push({ query: { where: route.query.into } });
//         if (Array.isArray(route.query.into)) {
//             const intos = (route.query.into as string[]).map(
//                 (lineupName) => "into-" + lineupName,
//             );
//             const lineupIds: string[] = [];
//             intos.forEach((lineupName) =>
//                 lineupIds.push(
//                     viewItemsFactory.value.lineupIdNameMap.get(lineupName)!,
//                 ),
//             );
//             lineupIds.forEach((lineupId, ix) => {
//                 const lineup =
//                     viewItemsFactory.value.createViewLine(lineupId);
//                 const toSpot = viewToSpots.value.get(lineup.lineup.toId)!;
//                 clickToSpot(new Event("restoreLineups"), toSpot);
//                 const fromSpot = viewFromSpots.value.get(lineup.lineup.fromId)!;
//                 clickFromSpot(new Event("restoreLineups"), fromSpot, lineup);
//             });
//         } else {
//             const into = "into-" + (route.query.into as string);
//             const lineupId = viewItemsFactory.value.lineupIdNameMap.get(into);
//             const lineup = viewItemsFactory.value.createViewLine(lineupId);
//             const toSpot = viewToSpots.value.get(lineup.lineup.toId)!;
//             clickToSpot(new Event("restoreLineups"), toSpot);
//             const fromSpot = viewFromSpots.value.get(lineup.lineup.fromId)!;
//             clickFromSpot(new Event("restoreLineups"), fromSpot, lineup);
//         }
//     } else {
//         return;
//     }
// });

// /* Показать previewPanel при выборе лайнапа (но не при отмене выбора); скрыть, если отменён весь выбор */
// watch(selectedLineups, (newVal, oldVal) => {
//     if (newVal.length > oldVal.length) {
//         previewPanelState.value.isToggled = true;
//     }
//     if (newVal.length === 0) {
//         previewPanelState.value.isToggled = false;
//     }
// });

function formSelectFromSpot(lineupId: string) {
    const lineup = viewLines.value.get(lineupId)!;
    const fromSpot = viewFromSpots.value.get(lineup.lineup.fromId)!;
    // fromSpot.isActive = false
    fromSpot.isSelected = true;
    viewFromSpots.value.set(fromSpot.fromSpot.spotId, fromSpot);
    methods_fromSpot.select(fromSpot, lineup);
    // selectFromSpotLineup(lineupId)
    // selectFromSpotToSpot(lineupId)
    selectFromSpotFormContext.value.close();
}
function formDeselectFromSpot(lineupId: string) {
    const lineup = viewLines.value.get(lineupId)!;
    const fromSpot = viewFromSpots.value.get(lineup.lineup.fromId)!;
    methods_fromSpot.deselect(fromSpot, lineup);

    selectFromSpotFormContext.value.close();
}

const selectFromSpotFormContext = ref<{
    isFormVisible: boolean;
    clickedFromSpot: ViewLandSpot | undefined;
    lineupIdToSelect: string | undefined;
    lineupIdToDeselect: string | undefined;
    relatedLineups: LineupItem[] | undefined;
    open: Function;
    close: Function;
}>({
    isFormVisible: false,
    clickedFromSpot: undefined,
    lineupIdToSelect: undefined,
    lineupIdToDeselect: undefined,
    relatedLineups: undefined,
    open: (fromSpot: ViewLandSpot) => {
        selectFromSpotFormContext.value.isFormVisible = true;
        selectFromSpotFormContext.value.clickedFromSpot = fromSpot;
    },
    close: () => {
        selectFromSpotFormContext.value.isFormVisible = false;
        selectFromSpotFormContext.value.clickedFromSpot = undefined;
    },
});

const contentPanelData = ref({
    isVisible: false,
    clickedLineup: undefined as LineupItem | undefined,
    linkedToSpot: undefined as ViewThrowSpot | undefined,
    linkedFromSpot: undefined as ViewLandSpot | undefined,
});
function openContentPanel(lineupId: string) {
    contentPanelData.value.isVisible = true;
    const lineup = viewLines.value.get(lineupId)!;
    contentPanelData.value.clickedLineup = lineup;
    contentPanelData.value.linkedToSpot = viewThrowSpots.value.get(
        lineup.lineup.toId,
    )!;
    contentPanelData.value.linkedFromSpot = viewFromSpots.value.get(
        lineup.lineup.fromId,
    )!;
}
function exitContentPanel() {
    contentPanelData.value.isVisible = false;
    contentPanelData.value.clickedLineup = undefined;
    contentPanelData.value.linkedFromSpot = undefined;
    contentPanelData.value.linkedToSpot = undefined;
}
/* onewaySmokeOption:[],
fakeSmokeOption:[],
bugSmokeOption:[],
forWhom:[],
onewayMolotovOption:[],
fakeMolotovOption:[],
bugMolotovOption:[],
bugHeOption:[], */

// 'hsl(' + (Math.random() * 359).toFixed(0) + ', 88%, 56%)'
// 'hsl(52, 88%, 56%)'
// const l2r = spotX < nadeX ? true : false

// type SvgItem = {
// 	nadeX: number,
// 	nadeY: number,
// 	spotX: number,
// 	spotY: number,
// 	duration: number | undefined,
// 	l2r: boolean,
// 	colorStr: string
// }
</script>

<template>
    <!-- Внешний wrapper понадобился, т.к. panzoom вешает за каким-то хуем -->
    <!-- слушатели на родителя, т.е. на wrapperinner. Из-за этого, сквозь братские  -->
    <!-- для цели panzoom(в этом случае братские для mapContainer-outer) элементы  -->
    <!-- проходят все события(click,drag,scroll и тд) от самой цели. То есть -->
    <!-- драг миникарты работает сквозь этот sibling(братский)-элемент  -->
    <main class="wrapperOuter">
        <div class="wrapperInner">
            <div class="mapContainer-outer" v-panzoom @wheel="">
                <div
                    class="mapContainer-inner"
                    ref="innerContainerRef"
                    @mousedown="isDragging = false"
                    @mousemove="isDragging = true"
                >
                    <!-- <CMS /> -->

                    <img
                        ref="imgRef"
                        @load="onImageLoaded"
                        @error="onImageLoadError"
                        class="mapImg"
                        :src="
                            currentRoute.length > 1
                                ? `/src/assets/maps/webp/${currentRoute}.webp`
                                : ''
                        "
                        :alt="imgMapError"
                    />

                    <template
                        v-for="[landId, viewLandSpot] in viewLandSpots.value"
                        :key="landId"
                    >
                        <LandSpot
                            v-show="!store.isCmsModeOn"
                            @click="viewLandSpot.$send('selfClicked', landId)"
                            :viewLandSpot="viewLandSpot"
                            ref="smokeSpritesRef"
                        />
                    </template>

                    <template
                        v-for="[lineupId, viewLine] in viewLines.value"
                        :key="lineupId"
                    >
                        <LineupLine :viewLine="viewLine" />
                    </template>

                    <template
                        v-for="[throwId, viewThrowSpot] in viewThrowSpots.value"
                        :key="throwId"
                    >
                        <ThrowSpot
                            v-show="!store.isCmsModeOn"
                            :viewThrowSpot="viewThrowSpot"
                        />
                    </template>
                </div>
            </div>
        </div>
        <!-- <ContentPanel
            @exit="exitContentPanel"
            :isVisible="contentPanelData.isVisible"
            :lineup="contentPanelData.clickedLineup!"
            :toSpot="contentPanelData.linkedToSpot!"
            :fromSpot="contentPanelData.linkedFromSpot!"
        /> -->

        <!-- <PreviewPanel
            :state="previewPanelState"
            @toggle="previewPanelHandlers.togglePreviewPanel"
            @toggleMinimize="previewPanelHandlers.toggleMinimize"
        >
            <PreviewCard
                v-for="lineup in selectedLineups"
                :toSpot="viewToSpots.get(lineup.toId)!"
                :lineup="lineup"
                :fromSpot="viewFromSpots.get(lineup.fromId)!"
                :isMinimized="previewPanelState.isMinimized"
                @lineupClicked="(lineupId) => openContentPanel(lineupId)"
            />
        </PreviewPanel> -->

        <FilterPanel
            v-bind="{
                isFiltersVisible,
                filtersPropData,
                filterState,
            }"
            @toggle="toggleFilters"
            @changeNadeType="filterHandlers.changeNadeType"
            @changeSide="filterHandlers.changeSide"
            @changeTickrate="filterHandlers.changeTickrate"
            @changeDifficulty="filterHandlers.changeDifficulty"
            @changeOnewaySmoke="filterHandlers.changeOnewaySmoke"
            @changeFakeSmoke="filterHandlers.changeFakeSmoke"
            @changeBugSmoke="filterHandlers.changeBugSmoke"
            @changeForWhom="filterHandlers.changeForWhom"
            @changeOnewayMolotov="filterHandlers.changeOnewayMolotov"
            @changeFakeMolotov="filterHandlers.changeFakeMolotov"
            @changeBugMolotov="filterHandlers.changeBugMolotov"
            @changeBugHe="filterHandlers.changeBugHe"
        />
    </main>

    <SelectFormOnClickThrowSpot
        v-if="selectFormThrowSpotContext.value.isFormVisible"
        :context="selectFormThrowSpotContext"
    />

    <Teleport to="body">
        <LoadingGoldsource
            v-if="isLoading"
            :nSegmentsVisible="nSegmentsVisible"
        >
            <template #title> Loading... </template>
            <template #message>
                Downloading de_{{ currentRoute }} image...
            </template>
        </LoadingGoldsource>
    </Teleport>
</template>

<style lang="scss" scoped>
.wrapperOuter {
    width: 100%;
    height: 100%;
    position: relative;
    min-width: 0;
    min-height: 0;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
}

.wrapperInner {
    width: 100%;
    height: 100%;
    // border: 5px solid rgb(255, 0, 98);
    overflow: hidden;
    position: relative;
    min-width: 0;
    min-height: 0;
    flex-grow: 1;
    background-color: var(--bg_dark);
    box-shadow:
        -1px -1px 0 0 var(--border_dark),
        1px 1px 0 0 var(--border_light);
    cursor: grab;

    &:active {
        cursor: grabbing;
    }

    display: flex;
    flex-direction: column;
}

.mapContainer-outer {
    min-height: 0;
    max-height: 0;
    max-height: 100%;
    // border: 3px solid yellow;
    display: flex;
    flex-direction: column;
}

.mapContainer-inner {
    position: relative;
    // z-index: 1;
    // border: 15px solid var(--bg_dark);
    // border: 5px solid rgb(29, 183, 55);
    aspect-ratio: 1/1;
    height: 100%;

    margin: auto;
    min-height: 0;
    min-width: 0;

    .mapImg {
        // min-height: 100%;
        // max-height: 100%;
        object-fit: contain;
        width: 100%;
        height: 100%;
        margin: auto;
        display: block;
        // border: 5px solid rgb(0, 89, 255);
        background-color: var(--bg_dark);
        text-align: center;
        pointer-events: none;
    }
}

.svgItemWrapper {
}

svg {
    position: absolute;
    // z-index: 1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    // background-color: rgba(0, 224, 90, 0.1);
    pointer-events: none;
}

line {
    stroke-miterlimit: $border_dark;
    // stroke: hsl(52, 88%, 56%);
    stroke-width: 1;
    stroke-linecap: round;
    stroke-dasharray: 1 1.5;
    animation: stroke 60s linear infinite;
    filter: drop-shadow(0px 0px 1px rgba(209, 191, 120, 0.3));
}

.lineSelected {
    stroke-dasharray: none;
}

.smokeexecIcon {
    display: block;
    position: absolute;
    translate: -50% -50%;
    animation: execution var(--duration) linear infinite;
    height: 16px;
    z-index: 2;
    pointer-events: none;

    @keyframes execution {
        0% {
            top: var(--spotY);
            left: var(--spotX);
            scale: 0.777;
            rotate: var(--rotate-from);
        }

        50% {
            scale: 1;
        }

        100% {
            top: var(--nadeY);
            left: var(--nadeX);
            scale: 0.9;
            rotate: var(--rotate-to);
        }
    }
}

@keyframes stroke {
    to {
        stroke-dashoffset: 0;
    }

    from {
        stroke-dashoffset: 100%;
    }
}

@keyframes rotate {
    from {
        rotate: 0deg;
    }

    to {
        rotate: 360deg;
    }
}
</style>
