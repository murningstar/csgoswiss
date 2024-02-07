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
import FromSpot from "@/components/SingleMap/FromSpot.vue";
import CMS from "@/components/cms/CMS.vue";
import FilterPanel from "@/components/SingleMap/FilterPanel.vue";
import Grenade from "@/components/SingleMap/_Grenade.vue";
import PreviewPanel from "@/components/SingleMap/PreviewPanel.vue";
import PreviewCard from "@/components/SingleMap/PreviewCard.vue";
import ContentPanel from "@/components/SingleMap/ContentPanel.vue";
import SelectForm from "@/components/SingleMap/SelectForm.vue";
import GS_Window from "@/components/UI/GS_Window.vue";
import LoadingGoldsource from "@/components/loadingGoldsource/LoadingGoldsource.vue";

// Data of Lineups & Spots
import { mirageGrenades } from "@/data/content/mirage/mirageGrenades";
import { ancientGrenades } from "@/data/content/ancient/ancientGrenades";
import { dust2Grenades } from "@/data/content/dust2/dust2Grenades";
import { infernoGrenades } from "@/data/content/inferno/infernoGrenades";
import { nukeGrenades } from "@/data/content/nuke/nukeGrenades";
import { overpassGrenades } from "@/data/content/overpass/overpassGrenades";
import { vertigoGrenades } from "@/data/content/vertigo/vertigoGrenades";

// composables
import { useLoadingGoldsource } from "@/composables/loadingGoldsource";
import { useAutoFetchMapData } from "@/composables/singleMap/autoFetchMapData"; // fetch lineups & spots data + autorefetch on route.path change
import { useFilter } from "@/composables/singleMap/filter";
// directives
import { vPanzoom } from "@/directives/vPanzoom";

// other
import { mapNamesList } from "@/data/mapNamesList";
import { nadeTypeList } from "@/data/nadeTypeList";

import type { MapItems } from "@/data/types/MapItems";
import type { Smoke as SmokeType } from "@/data/_old/Smoke";
// import type { Grenade } from "@/data/interfaces/Grenade";
import type { ThrowSpot } from "@/data/_old/ThrowSpot";
import type { Lineup } from "@/data/interfaces/Lineup";
import type { Spot } from "@/data/interfaces/Spot";
import { ViewItemsFactory, type LineupItem } from "@/data/types/ViewItems";
import type { ViewToSpot, ViewFromSpot } from "@/data/types/ViewItems";
import { useViewItems } from "@/composables/singleMap/useViewItems";

/* Global stuff */
const store = useSomestore();
const router = useRouter();
const route = useRoute();
const currentRoute = computed(() => route.path.slice(1));
const isDragging = ref(false);

/* Autorefetchable lineup & spots data on route change */
const { lineups, spots } = useAutoFetchMapData(); // Не отображаются *ВОЗМОЖНО* из-за того что они сначала пустые
const { viewItemsFactory, viewToSpots, viewLineups, viewFromSpots } =
    useViewItems(spots, lineups);

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

/* Возможно нужно вынести склеивание этого объекта в отдельный файл и импортировать его,
если склеивание происходит каждый раз при загрузке приложения.*/
// const allMapItems: any = {
//     mirageGrenades,
//     ancientGrenades,
//     dust2Grenades,
//     infernoGrenades,
//     nukeGrenades,
//     overpassGrenades,
//     vertigoGrenades,
// };
// const currentRouteMapItems = computed(() => {
//     if (mapNamesList.includes(currentRoute.value)) {
//         return allMapItems[`${currentRoute.value}Grenades`] as MapItems;
//     } else {
//         return { lineups: new Map(), spots: new Map() } as MapItems;
//     }
// });

// const spots = computed(() => currentRouteMapItems.value.spots);
// const lineups = computed(() => currentRouteMapItems.value.lineups);

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
// const viewLineups = ref<Map<Lineup["lineupId"], LineupItem>>(new Map());

/* VIEW-FROMSPOTS */
/* Лайнапов к одному fromСпоту 
может быть несколько, когда включено несколько toСпотов
Или когда редкий эдж кейс, когда уже выбрана граната, такая как на мираже смок в окно
и к ней выбирается еще молотов с той же позиции также в окно. Кому это может пригодиться?
Мб кто-то будет расставлять экзеки на карте и кому-то понадобится такой функционал. */
// const viewFromSpots = ref<Map<Spot["spotId"], ViewFromSpot>>(new Map());

/* activeToSpotsCounter используется только для вычисления hslColor, 
а именно, чтобы первый toSpot всегда был желтый */
// const activeToSpotsCounter = ref(0);

// const viewItemsFactory = computed(() => {
//     return new ViewItemsFactory(spots.value, lineups.value);
// });

// const selectedLineups = computed(() => {
//     const res = [...viewLineups.value]
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
//                     viewItemsFactory.value.createViewLineup(lineupId);
//                 const toSpot = viewToSpots.value.get(lineup.lineup.toId)!;
//                 clickToSpot(new Event("restoreLineups"), toSpot);
//                 const fromSpot = viewFromSpots.value.get(lineup.lineup.fromId)!;
//                 clickFromSpot(new Event("restoreLineups"), fromSpot, lineup);
//             });
//         } else {
//             const into = "into-" + (route.query.into as string);
//             const lineupId = viewItemsFactory.value.lineupIdNameMap.get(into);
//             const lineup = viewItemsFactory.value.createViewLineup(lineupId);
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

/* Эта функция очищает viewToSpots, viewLineups и viewFromSpots
И на основе lineups и spots заполняет значениями viewToSpots.
P.S. viewLineups и viewFromSpots создаются в обработчике клика. */

// function populateRefsWithData() {
//     viewToSpots.value.clear();
//     viewLineups.value.clear();
//     viewFromSpots.value.clear();
//     /* Сборка viewToSpots */
//     viewToSpots.value = viewItemsFactory.value.generateViewToSpots();
//     console.log("refs Populated");
// }
// populateRefsWithData();
// // /* При смене маршрута, меняются computed lineups и spots. */
// watch(currentRouteMapItems, (nv) => {
//     populateRefsWithData();
// });

// watch(viewLineups, () => {
//     console.log("viewLineups watcher:");
//     console.log(viewLineups.value);
// });

/* onClick TOSPOT */
function clickToSpot(event: Event, clickedToSpot: ViewToSpot) {
    console.log("clicked singlemap.vue");
    if (
        event.type == "restoreLineups" ||
        (isDragging.value == false &&
            (event.target as HTMLButtonElement).tagName == "BUTTON")
    ) {
        if (!clickedToSpot.isActive && !clickedToSpot.isSelected) {
            methods_toSpot.activeOnClick(clickedToSpot);

            return;
        }
        if (clickedToSpot.isActive && !clickedToSpot.isSelected) {
            methods_toSpot.deactivateOnClick(clickedToSpot);
            return;
        }
        if (!clickedToSpot.isActive && clickedToSpot.isSelected) {
            //mb form
            return;
        }
        if (clickedToSpot.isActive && clickedToSpot.isSelected) {
            //mb form
            return;
        }
    }
}

function clickFromSpot(
    event: Event,
    fromSpot: ViewFromSpot,
    lineup: LineupItem | undefined,
) {
    const intersection =
        fromSpot.activeLineupIds.size + fromSpot.selectedLineupIds.size;
    if (intersection === 1) {
        if (fromSpot.isActive) {
            const activeLineupId = [...fromSpot.activeLineupIds][0];
            const lineup = viewLineups.value.get(activeLineupId)!;
            methods_fromSpot.select(fromSpot, lineup);
            return;
        }
        if (fromSpot.isSelected) {
            const selectedLineupId = [...fromSpot.selectedLineupIds][0];
            const lineup = viewLineups.value.get(selectedLineupId)!;
            methods_fromSpot.deselect(fromSpot, lineup);
            return;
        }
    }
    if (intersection > 1 && event?.type == "restoreLineups") {
        fromSpot.isSelected = true;
        viewFromSpots.value.set(fromSpot.fromSpot.spotId, fromSpot);
        methods_fromSpot.select(fromSpot, lineup!);
        return;
    }
    if (intersection > 1) {
        selectFromSpotFormContext.value.open(fromSpot);
    }
}

const methods_toSpot = {
    activeOnClick(toSpot: ViewToSpot) {
        activeToSpotsCounter.value++;
        {
            // Логика для вычисления средней длительности(анимации)
            const toSpots: Spot[] = [];
            const durations: number[] = [];
            toSpot.lineupIds.forEach((lineupId) => {
                try {
                    const lineup =
                        viewItemsFactory.value.lineups.get(lineupId)!;
                    toSpots.push(spots.value.get(lineup.fromId)!);
                } catch (error) {
                    console.log(
                        "Probably problem is Bad/Damaged Lineup Data. Most probably Map key Id is not the same as Item's Id",
                    );
                    console.log("Error: ");
                    console.error(error);
                }
            });
            toSpots.forEach((fromSpot) => {
                const length = Math.sqrt(
                    (fromSpot.coords.x - toSpot.toSpot.coords.x) ** 2 +
                        (fromSpot.coords.y - toSpot.toSpot.coords.y) ** 2,
                );
                const duration = 2.2 + length * 0.01;
                durations.push(duration);
            });
            const avgDuration = (
                durations.reduce((acc, next) => acc + next, 0) /
                durations.length
            ).toFixed(2);
            // присваивание результата
            toSpot.avgDuration = avgDuration;
        }
        methods_toSpot.toActiveDeps(toSpot);
        toSpot.hslColor =
            activeToSpotsCounter.value > 1
                ? (Math.random() * 359).toFixed(0)
                : "52";
        toSpot.isActive = true;
    },
    toActiveDeps(toSpot: ViewToSpot) {
        // toActive только те, которые не selected и также не active.
        const lineupIds = toSpot
            .getNonSelectedLineupIds()
            .filter((lineupId) => !toSpot.activeLineupIds.has(lineupId));

        lineupIds.forEach((lineupId) => {
            const viewLineup =
                viewItemsFactory.value.createViewLineup(lineupId);
            viewLineups.value.set(lineupId, viewLineup);
            toSpot.activeLineupIds.add(lineupId);
            toSpot.activeFromSpotIds.push(viewLineup.lineup.fromId);
            methods_fromSpot.activate(viewLineup);
        });
    },
    select(lineup: LineupItem) {
        const toSpot = viewToSpots.value.get(lineup.lineup.toId)!;
        toSpot.isSelected = true;
        toSpot.isActive = false;
        const ix1 = toSpot.activeFromSpotIds.findIndex(
            (entry) => entry == lineup.lineup.fromId,
        );
        toSpot.activeFromSpotIds.splice(ix1, 1);
        toSpot.activeLineupIds.delete(lineup.lineup.lineupId);
        toSpot.selectedFromSpotIds.push(lineup.lineup.fromId);
        toSpot.selectedLineupIds.add(lineup.lineup.lineupId);

        toSpot.activeLineupIds.forEach((lineupId) => {
            const lineup = viewLineups.value.get(lineupId)!;
            const fromSpot = viewFromSpots.value.get(lineup.lineup.fromId)!;
            const intersection =
                fromSpot.activeLineupIds.size + fromSpot.selectedLineupIds.size;
            if (intersection > 1) {
                //активирован/выбран не только удаляемым лайнапом
                const ix1 = fromSpot.activatedByToSpotIds.findIndex(
                    (entry) => entry == lineup.lineup.toId,
                );
                fromSpot.activatedByToSpotIds.splice(ix1, 1);
                fromSpot.activeLineupIds.delete(lineupId);
                fromSpot.filter.nadeType[lineup.lineup.nadeType]--;
                fromSpot.filter.side[lineup.lineup.side]--;
                fromSpot.filter.tickrate[lineup.lineup.tickrate]--;
                fromSpot.filter.difficulties[lineup.lineup.difficulty]--;
                fromSpot.lineupIds = fromSpot.lineupIds.filter(
                    (lineupIdFltr) => lineupId != lineupIdFltr,
                );
                console.log(493);
                if (fromSpot.activeLineupIds.size < 1) {
                    fromSpot.isActive = false;
                    console.log(496);
                }
            } else {
                //связан только с удаляемым лайнапом => удаляем
                viewFromSpots.value.delete(lineup.lineup.fromId);
            }
            viewLineups.value.delete(lineupId);
            const ix1 = toSpot.activeFromSpotIds.findIndex(
                (entry) => entry == lineup.lineup.fromId,
            );
            toSpot.activeFromSpotIds.splice(ix1, 1);
            toSpot.activeLineupIds.delete(lineupId);
        });
    },

    deactivateOnClick(toSpot: ViewToSpot) {
        activeToSpotsCounter.value--;
        toSpot.isActive = false;
        methods_toSpot.toInactiveDeps(toSpot);
    },
    toInactiveDeps(toSpot: ViewToSpot) {
        toSpot.activeLineupIds.forEach((lineupId) => {
            const viewLineup = viewLineups.value.get(lineupId)!;
            const ix1 = toSpot.activeFromSpotIds.findIndex(
                (entry) => entry == viewLineup.lineup.fromId,
            );
            toSpot.activeFromSpotIds.splice(ix1, 1);
            toSpot.activeLineupIds.delete(lineupId);
            methods_fromSpot.deactivate(viewLineup);
            viewLineups.value.delete(lineupId);
        });
    },
};
const methods_lineup = {};
const methods_fromSpot = {
    select(fromSpot: ViewFromSpot, lineup: LineupItem) {
        fromSpot.isSelected = true;
        fromSpot.activeLineupIds.delete(lineup.lineup.lineupId);
        fromSpot.selectedLineupIds.add(lineup.lineup.lineupId);
        const ix1 = fromSpot.activatedByToSpotIds.findIndex(
            (entry) => entry == lineup.lineup.toId,
        );
        fromSpot.activatedByToSpotIds.splice(ix1, 1);
        fromSpot.selectedByToSpotIds.push(lineup.lineup.toId);
        if (fromSpot.activeLineupIds.size < 1) {
            fromSpot.isActive = false;
        }
        methods_fromSpot.toSelectedDeps(lineup);
    },
    toSelectedDeps(lineup: LineupItem) {
        console.log("lineup ", lineup.lineup.lineupId, " made selected");
        lineup.isSelected = true;
        lineup.isActive = false;
        viewLineups.value.set(lineup.lineup.lineupId, lineup);
        methods_toSpot.select(lineup);
    },
    deselect(fromSpot: ViewFromSpot, lineup: LineupItem) {
        const intersection =
            fromSpot.activeLineupIds.size + fromSpot.selectedLineupIds.size;
        if (intersection < 2) {
            viewFromSpots.value.delete(fromSpot.fromSpot.spotId);
            viewLineups.value.delete(lineup.lineup.lineupId);
            const toSpot = viewToSpots.value.get(lineup.lineup.toId)!;
            const ix1 = toSpot.selectedFromSpotIds.findIndex(
                (entry) => entry == fromSpot.fromSpot.spotId,
            );
            toSpot.selectedFromSpotIds.splice(ix1, 1);
            toSpot.selectedLineupIds.delete(lineup.lineup.lineupId);
            if (toSpot.selectedLineupIds.size < 1) {
                toSpot.isSelected = false;
            }
            toSpot.isActive = true;
            methods_toSpot.toActiveDeps(toSpot);
        } else {
            // if (fromSpot.selectedLineupIds.size < 2) {
            // fromSpot.isSelected = false
            const ix1 = fromSpot.selectedByToSpotIds.findIndex(
                (entry) => entry == lineup.lineup.toId,
            );
            fromSpot.selectedByToSpotIds.splice(ix1, 1);
            fromSpot.selectedLineupIds.delete(lineup.lineup.lineupId);
            fromSpot.lineupIds = fromSpot.lineupIds.filter(
                (lId) => lId != lineup.lineup.lineupId,
            );
            fromSpot.filter.nadeType[lineup.lineup.nadeType]--;
            fromSpot.filter.side[lineup.lineup.side]--;
            fromSpot.filter.tickrate[lineup.lineup.tickrate]--;
            fromSpot.filter.difficulties[lineup.lineup.difficulty]--;
            const toSpot = viewToSpots.value.get(lineup.lineup.toId)!;
            const ix1_toSpot = toSpot.selectedFromSpotIds.findIndex(
                (entry) => entry == fromSpot.fromSpot.spotId,
            );
            toSpot.selectedFromSpotIds.splice(ix1_toSpot, 1);
            toSpot.selectedLineupIds.delete(lineup.lineup.lineupId);
            if (toSpot.selectedLineupIds.size < 1) {
                toSpot.isSelected = false;
            }
            toSpot.isActive = true;
            methods_toSpot.toActiveDeps(toSpot);
            // } else {}
        }
    },

    activate(lineup: LineupItem) {
        console.log(587);
        const toId = lineup.lineup.toId;
        const toSpot = viewToSpots.value.get(toId)!;
        console.log("toSpot: ", toSpot);
        const fromId = lineup.lineup.fromId;
        const fromSpotExists = viewFromSpots.value.has(fromId);
        console.log(592, "exists? :", fromSpotExists, performance.now());
        if (!fromSpotExists) {
            // если не существует - создать
            const fromSpot = viewItemsFactory.value.createActiveViewFromSpot(
                lineup.lineup.lineupId,
            );
            console.log(fromSpot);
            viewFromSpots.value.set(fromId, fromSpot);
        } else {
            //fromSpot может быть создан другим toSpotом или этим же, но через другой лайнап
            const existingFromSpot = viewFromSpots.value.get(fromId)!;
            existingFromSpot.activatedByToSpotIds.push(lineup.lineup.toId);
            existingFromSpot.activeLineupIds.add(lineup.lineup.lineupId);
            existingFromSpot.lineupIds.push(lineup.lineup.lineupId);
            existingFromSpot.filter.nadeType[lineup.lineup.nadeType]++;
            existingFromSpot.filter.side[lineup.lineup.side]++;
            existingFromSpot.filter.tickrate[lineup.lineup.tickrate]++;
            existingFromSpot.filter.difficulties[lineup.lineup.difficulty]++;
            existingFromSpot.isActive = true;
            console.log(existingFromSpot);
            viewFromSpots.value.set(fromId, existingFromSpot);
        }
    },
    deactivate(lineup: LineupItem) {
        //delete if not selected/activated by any other toSpot
        /* не уверен на 100% в этой функции, т.к. скопировал ее код из прототипа другой.
		Т.е. она не "opinionated"  */
        const lineupId = lineup.lineup.lineupId;
        const fromSpot = viewFromSpots.value.get(lineup.lineup.fromId)!;
        const intersection =
            fromSpot.activeLineupIds.size + fromSpot.selectedLineupIds.size;
        if (intersection > 1) {
            //активирован/выбран не только удаляемым лайнапом
            const ix1 = fromSpot.activatedByToSpotIds.findIndex(
                (entry) => entry == lineup.lineup.toId,
            );
            fromSpot.activatedByToSpotIds.splice(ix1, 1);
            fromSpot.activeLineupIds.delete(lineupId);
            fromSpot.filter.nadeType[lineup.lineup.nadeType]--;
            fromSpot.filter.side[lineup.lineup.side]--;
            fromSpot.filter.tickrate[lineup.lineup.tickrate]--;
            fromSpot.filter.difficulties[lineup.lineup.difficulty]--;
            fromSpot.lineupIds = fromSpot.lineupIds.filter(
                (lineupIdFltr) => lineupId != lineupIdFltr,
            );
            if (fromSpot.activeLineupIds.size < 1) {
                fromSpot.isActive = false;
            }
        } else {
            //связан только с удаляемым лайнапом => удаляем
            viewFromSpots.value.delete(lineup.lineup.fromId);
        }
    },
};

function formSelectFromSpot(lineupId: string) {
    const lineup = viewLineups.value.get(lineupId)!;
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
    const lineup = viewLineups.value.get(lineupId)!;
    const fromSpot = viewFromSpots.value.get(lineup.lineup.fromId)!;
    methods_fromSpot.deselect(fromSpot, lineup);

    selectFromSpotFormContext.value.close();
}

const selectFromSpotFormContext = ref<{
    isFormVisible: boolean;
    clickedFromSpot: ViewFromSpot | undefined;
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
    open: (fromSpot: ViewFromSpot) => {
        selectFromSpotFormContext.value.isFormVisible = true;
        selectFromSpotFormContext.value.clickedFromSpot = fromSpot;
    },
    close: () => {
        selectFromSpotFormContext.value.isFormVisible = false;
        selectFromSpotFormContext.value.clickedFromSpot = undefined;
    },
});
const selectFormProps = {
    activeLineups: computed(() => {
        if (selectFromSpotFormContext.value.clickedFromSpot) {
            const lineupPropObjArray = [
                ...selectFromSpotFormContext.value.clickedFromSpot!
                    .activeLineupIds,
            ].map((activeLineupId) => {
                const lineup = viewLineups.value.get(activeLineupId)!;
                const lineupPropObj = {
                    lineupItem: lineup,
                    viewToSpot: viewToSpots.value.get(lineup.lineup.toId)!,
                    viewFromSpot: viewFromSpots.value.get(
                        lineup.lineup.fromId,
                    )!,
                };
                return lineupPropObj;
            });
            return lineupPropObjArray;
        }
    }),
    selectedLineups: computed(() => {
        if (selectFromSpotFormContext.value.clickedFromSpot) {
            const lineupPropObjArray = [
                ...selectFromSpotFormContext.value.clickedFromSpot!
                    .selectedLineupIds,
            ].map((selectedLineupId) => {
                const lineup = viewLineups.value.get(selectedLineupId)!;
                const lineupPropObj = {
                    lineupItem: lineup,
                    viewToSpot: viewToSpots.value.get(lineup.lineup.toId)!,
                    viewFromSpot: viewFromSpots.value.get(
                        lineup.lineup.fromId,
                    )!,
                };
                return lineupPropObj;
            });
            return lineupPropObjArray;
        }
    }),
};

const contentPanelData = ref({
    isVisible: false,
    clickedLineup: undefined as LineupItem | undefined,
    linkedToSpot: undefined as ViewToSpot | undefined,
    linkedFromSpot: undefined as ViewFromSpot | undefined,
});
function openContentPanel(lineupId: string) {
    contentPanelData.value.isVisible = true;
    const lineup = viewLineups.value.get(lineupId)!;
    contentPanelData.value.clickedLineup = lineup;
    contentPanelData.value.linkedToSpot = viewToSpots.value.get(
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

                    <template v-for="[id, value] in viewToSpots.value">
                        <div>{{ id }}</div>
                    </template>

                    <!-- ЭТО БЫЛО ЗАКОММЕНТИРОВАНО ЕЩЁ ДО ИЗМЕНЕНИЙ -->
                    <!-- <template v-for="[toId, toItem] in viewToSpots">
						<Grenade @click="toggleNade($event, toId)"
							:spot="toItem.toSpot" ref="smokeSpritesRef"
							:pointSize="pointSize"
							:isToggled="store.toggledToSpots.has(toItem.toSpot.spotId)"
							:filter="filterState" v-show="(props.nadeType === 'All' || props.nadeType === 'Smoke') &&
								props.side === spot.side &&
								props.tickrate === spot.tickrate &&
								props.difficultiesState[`${spot.difficulty}Visible` as keyof typeof props.difficultiesState] &&
								(
									spot.isOnewaySmoke === true && (
										props.onewayOption === 'Oneways only' ||
										props.onewayOption === 'All'
									) ||
									spot.isOnewaySmoke === false && (
										props.onewayOption === 'Regular only' ||
										props.onewayOption === 'All'
									)
								) &&
								(
									spot.isFakeSmoke === true && (
										props.fakeOption === 'FakeSmokes only' ||
										props.fakeOption === 'All'
									) ||
									spot.isFakeSmoke === false && (
										props.fakeOption === 'Regular only' ||
										props.fakeOption === 'All'
									)
								) &&
								(
									spot.isFakeSmoke === true && (
										props.bugOption === 'BugSmokes only' ||
										props.bugOption === 'All'
									) ||
									spot.isFakeSmoke === false && (
										props.bugOption === 'Regular only' ||
										props.bugOption === 'All'
									)
								)" />
					</template> -->

                    <!-- ЭТО БЫЛО ЗАКОММЕНТИРОВАНО ЕЩЁ ДО ИЗМЕНЕНИЙ -->
                    <!-- <template v-for="[id, smoke] in smokes">
						<SmokeComponent @click="onGrenadeClick($event, smoke)"
							:smoke="smoke" :pointSize="pointSize"
							:nadeType="filterState.nadeType"
							:side="filterState.side"
							:tickrate="filterState.tickrate"
							:difficultiesState="filterState.difficultiesState"
							:onewayOption="filterState.onewaySmokeOption"
							:fakeOption="filterState.fakeSmokeOption"
							:bugOption="filterState.bugSmokeOption"
							ref="smokeSpritesRef"
							:isSelected="store.activeGrenadeItems.has(smoke.id) ? true : false" />
					</template> -->

                    
                    <!-- <template v-for="[toId, toItem] in viewToSpots">
                        <Grenade
                            v-show="!store.isCmsModeOn"
                            @click="clickToSpot($event, toItem)"
                            :toItem="toItem"
                            ref="smokeSpritesRef"
                            :pointSize="pointSize"
                            :isActive="toItem.isActive"
                            :isSelected="toItem.isSelected"
                            :filter="filterState"
                        />
                    </template> -->

                    <!-- <template v-for="[viewLineupId, viewLineup] in viewLineups">
                        <div
                            class="svgItemWrapper"
                            v-show="
                                (viewLineup.lineup.nadeType ===
                                    filterState.nadeType ||
                                    filterState.nadeType === 'all') &&
                                filterState.side === viewLineup.lineup.side &&
                                filterState.tickrate ===
                                    viewLineup.lineup.tickrate &&
                                filterState.difficulties.has(
                                    viewLineup.lineup.difficulty,
                                ) &&
                                !store.isCmsModeOn
                            "
                        >
                            <svg>
                                <line
                                    :x1="`${
                                        viewFromSpots.get(
                                            viewLineup.lineup.fromId,
                                        )?.fromSpot.coords.x
                                    }%`"
                                    :y1="`${
                                        viewFromSpots.get(
                                            viewLineup.lineup.fromId,
                                        )?.fromSpot.coords.y
                                    }%`"
                                    :x2="`${
                                        viewToSpots.get(viewLineup.lineup.toId)
                                            ?.toSpot.coords.x
                                    }%`"
                                    :y2="`${
                                        viewToSpots.get(viewLineup.lineup.toId)
                                            ?.toSpot.coords.y
                                    }%`"
                                    :stroke="
                                        viewLineup.isSelected
                                            ? `hsl(${
                                                  viewToSpots.get(
                                                      viewLineup.lineup.toId,
                                                  )?.hslColor
                                              }, 100%, 56%)`
                                            : `hsl(${
                                                  viewToSpots.get(
                                                      viewLineup.lineup.toId,
                                                  )?.hslColor
                                              }, 80%, 55%)`
                                    "
                                    :class="{
                                        lineSelected: viewLineup.isSelected,
                                    }"
                                />
                            </svg>
                            <img
                                ref="smokeexecIcon"
                                src="@/assets/icons/smokeicon.png"
                                alt=""
                                class="smokeexecIcon"
                                :style="{
                                    '--spotX': `${
                                        viewFromSpots.get(
                                            viewLineup.lineup.fromId,
                                        )?.fromSpot.coords.x
                                    }%`,
                                    '--spotY': `${
                                        viewFromSpots.get(
                                            viewLineup.lineup.fromId,
                                        )?.fromSpot.coords.y
                                    }%`,
                                    '--nadeX': `${
                                        viewToSpots.get(viewLineup.lineup.toId)
                                            ?.toSpot.coords.x
                                    }%`,
                                    '--nadeY': `${
                                        viewToSpots.get(viewLineup.lineup.toId)
                                            ?.toSpot.coords.y
                                    }%`,
                                    '--duration': `${
                                        viewToSpots.get(viewLineup.lineup.toId)
                                            ?.avgDuration
                                    }s`,
                                    '--rotate-from': `${
                                        -Math.random() * 72 * 10 -
                                        Math.random() * 270
                                    }deg`,
                                    '--rotate-to': `${
                                        Math.random() * 72 * 10
                                    }deg`,
                                    filter: `hue-rotate(${
                                        Number(
                                            viewToSpots.get(
                                                viewLineup.lineup.toId,
                                            )?.hslColor,
                                        ) +
                                        360 -
                                        40
                                    }deg) sepia(33%)`,
                                }"
                            />
                        </div>
                    </template> -->

                    <!-- <template v-for="[fromId, fromItem] in viewFromSpots">
                        <FromSpot
                            v-show="!store.isCmsModeOn"
                            :fromItem="fromItem"
                            @myclick="
                                clickFromSpot($event, fromItem, undefined)
                            "
                            :filter="filterState"
                        />
                    </template> -->
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

    <SelectForm
        :isVisible="selectFromSpotFormContext.isFormVisible"
        @exit="selectFromSpotFormContext.close()"
        :activeLineups="selectFormProps.activeLineups.value!"
        :selectedLineups="selectFormProps.selectedLineups.value!"
        @select="(lineupId) => formSelectFromSpot(lineupId)"
        @deselect="(lineupId) => formDeselectFromSpot(lineupId)"
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
