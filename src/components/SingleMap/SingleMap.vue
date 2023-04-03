<script lang="ts" setup>
// vue
import { ref, computed, watch, onMounted, type StyleValue, reactive } from "vue";
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import { useSomestore } from "@/stores/somestore";
// libs
import panzoom from "panzoom"
import { gsap } from "gsap"
import { random } from "nanoid";
import { createMachine } from "xstate";
// components
import SmokeComponent from "@/components/SingleMap/Smoke.vue"
import MolotovComponent from "@/components/SingleMap/Molotov.vue"
import FlashComponent from "@/components/SingleMap/Flash.vue"
import HeComponent from "@/components/SingleMap/He.vue"
import FromSpot from "@/components/SingleMap/FromSpot.vue"
import CMS from "@/components/cms/CMS.vue";
import FilterPanel from "@/components/SingleMap/FilterPanel.vue"
import Grenade from "@/components/SingleMap/_Grenade.vue"
// data
import { mirageGrenades } from "@/data/v2_spotSvyaz/mirage/mirageGrenadesV2";
import { ancientGrenades } from "@/data/v2_spotSvyaz/ancient/ancientGrenadesV2";
import { dust2Grenades } from "@/data/v2_spotSvyaz/dust2/dust2GrenadesV2";
import { infernoGrenades } from "@/data/v2_spotSvyaz/inferno/infernoGrenadesV2";
import { nukeGrenades } from "@/data/v2_spotSvyaz/nuke/nukeGrenadesV2";
import { overpassGrenades } from "@/data/v2_spotSvyaz/overpass/overpassGrenadesV2";
import { vertigoGrenades } from "@/data/v2_spotSvyaz/vertigo/vertigoGrenadesV2";
// other
import { useLoadingGoldsourceLogic } from "@/components/Loading_goldsource/loading_goldsource"
import { maplist } from "@/data/maplist"
import type { MapItems } from "@/data/v2_spotSvyaz/MapItemsV2"
import { nadeTypeList } from "@/data/nadeTypeList";
import type { Smoke as SmokeType } from "@/data/interfaces/Smoke";
// import type { Grenade } from "@/data/interfaces/Grenade";
import type { Difficulty, ForWhom, NadeType, Side, Tickrate } from "@/data/types/GrenadeProperties";
import type { ThrowSpot } from "@/data/interfaces/ThrowSpot";
import type { Lineup } from "@/data/v2_spotSvyaz/Lineup";
import type { Spot } from "@/data/v2_spotSvyaz/Spot";


const { isLoading, nSegmentsVisible, startLoading, endLoading, onImageLoadError } = useLoadingGoldsourceLogic()
const store = useSomestore()

const route = useRoute()
const currentRoute = computed(() => route.path.slice(1))


/* Возможно нужно вынести склеивание этого объекта в отдельный файл и импортировать его,
если склеивание происходит каждый раз при загрузке приложения.*/
const allMapItems: any = {
	mirageGrenades,
	ancientGrenades,
	dust2Grenades,
	infernoGrenades,
	nukeGrenades,
	overpassGrenades,
	vertigoGrenades
}
const currentRouteMapItems = computed(() => {
	if (maplist.includes(currentRoute.value)) {
		return allMapItems[`${currentRoute.value}Grenades`] as MapItems
	}
	else {
		return { lineups: new Map(), spots: new Map() } as MapItems
	}
})
// Сделал каждой гранате текущей карты по computed для визуального облегчения template
// const smokes = computed(() => currentRouteMapItems.value.smokes)
// const molotovs = computed(() => currentRouteMapItems.value.molotovs)
// const flashes = computed(() => currentRouteMapItems.value.flashes)
// const hes = computed(() => currentRouteMapItems.value.hes)
// const throwSpots = computed(() => currentRouteMapItems.value.throwSpots)
const spots = computed(() => currentRouteMapItems.value.spots)
const lineups = computed(() => currentRouteMapItems.value.lineups)



/* computed alt attribute value for images of maps */
const imgMapError = computed(() => {
	if (maplist.includes(currentRoute.value)) {
		return `Downloading error of map image de_${currentRoute.value}, please refresh the page or choose another map`
	} else {
		return `There isn't such map in active pool, please choose another map`
	}
})
/* открывает окно загрузки когда путь изменился */
watch(() => route.path, (newPath, oldPath) => {
	/* если убрать условие, то всё все равно будет работать, а именно
	- при клике на ту же карту, startloading не сработает,
	- при клике на другую карту startloading сработает.
	Почему так, хз его знает, проверку оставил на всякий случай */
	if (newPath != oldPath) {
		startLoading()
	}
})

const imgRef = ref(null)
const smokeSpritesRef = ref([])

function onImageLoaded(event: Event) {
	// console.log("%cimage loaded", "color:green", performance.now());
	endLoading()
	/* ПОСЧИТАТЬ РАЗМЕР ТОЧКИ ПРИ ЗАГРУЗКЕ КАРТЫ */
	if (store.isFirstLoad) {
		/* Условие нужно, чтобы ресайз не происходил при зуме и переходе на другой роут */
		const mapside = getElemSide(event.target as HTMLImageElement)
		const mapCoefd = mapside * pxCoef
		if (mapside > 450) {
			pointSize.value = Math.ceil(mapCoefd * 10) // 10px это по дефолту(пересчитываю этот размер для ресайза)
		} else {
			pointSize.value = Math.ceil(mapCoefd * 10) // 10px это по дефолту(пересчитываю этот размер для ресайза)
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
			ease: 'linear'
		})
	});
}
/* ИЗМЕНИТЬ РАЗМЕР ТОЧКИ НА РЕСАЙЗЕ */
const imgResizeObs = new ResizeObserver((obsedElements) => {
	if (!store.isFirstLoad) {
		const mapside = obsedElements[0].contentRect.height
		const mapCoefd = mapside * pxCoef
		if (mapside > 450) {
			pointSize.value = Math.ceil(mapCoefd * 10) // 10px это по дефолту(пересчитываю этот размер для ресайза)
		} else {
			pointSize.value = Math.ceil(mapCoefd * 10) // 10px это по дефолту(пересчитываю этот размер для ресайза)
			// pointSize.value = Math.ceil(mapCoefd) * 10
			// Карта 619x619, точка 10x10, коэф 619/10 = 61.9
		}
	}

})
/* Можно спокойно подгружать все карты и пикча текущей карты
загружена не будет, т.к. браузер увидит, что она есть в кэше => 
функционал для отслеживания уже загруженных карт не нужен */
async function preloadRestImages() {
	maplist.forEach((map) => {
		let img = new Image()
		img.src = `/src/assets/maps/webp/${map}.webp`
		// img.onload = (e) => { console.log(`%c ${map} image loaded`, "color:blue") }
	})
}

const outerContainerRef = ref<HTMLDivElement | null>(null)
const innerContainerRef = ref(null)
const pointSize = ref(0)
const pxCoef = 0.0016155 // пропорция 1px к размеру карты

function getElemSide(elem: HTMLImageElement) {
	return elem.getBoundingClientRect().height
}
onMounted(() => {

	preloadRestImages();

	panzoom(outerContainerRef.value as HTMLDivElement, {
		maxZoom: 3,
		minZoom: 1,
		bounds: true,
		zoomDoubleClickSpeed: 1,
	});


	imgResizeObs.observe(imgRef.value!)
})



const isFiltersVisible = ref(false)
const toggleFilters = () => { isFiltersVisible.value = !isFiltersVisible.value }

const filtersPropData = reactive({
	nadeTypeList: nadeTypeList,

})
const filterState = reactive({
	nadeType: 'smoke' as NadeType | 'all',
	side: 't' as Side,
	tickrate: 128 as Tickrate,
	difficulties: new Set([
		'easy',
		'normal',
		'medium',
		'hard',
		'pixelPerfect',
	]) as Set<Difficulty>,
	onewaySmokeOption: 'All',
	fakeSmokeOption: 'All',
	bugSmokeOption: 'All',
	forWhom: 'yourself' as ForWhom,
	onewayMolotovOption: 'All',
	fakeMolotovOption: 'All',
	bugMolotovOption: 'All',
	bugHeOption: 'All',
})
watch(filterState, (newval) => {
	console.log(newval.difficulties);
})
const filterHandlers = {
	changeNadeType: (newVal: any) => {
		filterState.nadeType = newVal
	},
	changeSide: (newVal: any) => {
		filterState.side = newVal
	},
	changeTickrate: (newVal: any) => {
		filterState.tickrate = newVal
	},
	changeDifficulty: (option: Difficulty, newVal: any) => {
		if (newVal === true) {
			filterState.difficulties.add(option)
		} else {
			filterState.difficulties.delete(option)
		}
		console.log('difficulty modelValue SINGLEMAP: ', newVal);
	},
	// changeDifficulty: (newVal: any, option: string) => {
	// 	filterState.difficultiesState[`${option}Visible` as keyof typeof filterState.difficultiesState] = newVal
	// 	console.log(filterState.difficultiesState[`${option}Visible` as keyof typeof filterState.difficultiesState]);
	// },
	changeOnewaySmoke: (newVal: any) => {
		filterState.onewaySmokeOption = newVal
	},
	changeFakeSmoke: (newVal: any) => {
		filterState.fakeSmokeOption = newVal
	},
	changeBugSmoke: (newVal: any) => {
		filterState.bugSmokeOption = newVal
	},
	changeForWhom: (newVal: any) => {
		filterState.forWhom = newVal
	},
	changeOnewayMolotov: (newVal: any) => {
		filterState.onewayMolotovOption = newVal
	},
	changeFakeMolotov: (newVal: any) => {
		filterState.fakeMolotovOption = newVal
	},
	changeBugMolotov: (newVal: any) => {
		filterState.bugMolotovOption = newVal
	},
	changeBugHe: (newVal: any) => {
		filterState.bugHeOption = newVal
	},
}

const isDragging = ref(false)




// const selectedNadesStateMachine = createMachine({
// 	initial: "initial",
// 	states: {
// 		initial: {
// 			on: {
// 				FIRST_NADE_CLICKED: "selectingFirstSpot"
// 			}
// 		},
// 		selectingFirstSpot: {
// 			on: {
// 				FIRST_SPOT_CLICKED: "singleLineupShowing",
// 				SECOND_NADE_CLICKED: ""
// 			}
// 		},
// 		singleNadeSelected: {
// 			initial:"idle",
// 			states:{
// 				idle:{},
// 				showingData:{},

// 			}
// 		},

// 	}
// })


/* onClick TOSPOT */
function toggleNade(event: Event, toId: Spot['spotId']) {
	if (isDragging.value == false &&
		(event.target as HTMLButtonElement).tagName == 'BUTTON') {

		if (!store.activeToSpots.has(toId)) {
			const toSpotItem = renderToSpots.value.get(toId)!

			console.log(299);
			const fromSpots: Spot[] = []
			const durations: number[] = []
			console.log(302);
			toSpotItem?.lineupIds.forEach((lineupid, ix) => {
				try {
					const lineup = lineups.value.get(lineupid)!
					fromSpots.push(spots.value.get(lineup.fromId)!)
				}
				catch (error) {
					console.log('Probably problem is Bad/Damaged Lineup Data;');
					console.log("Most probably Map key Id is not the same as Item's Id");
					console.log('Error: ');
					console.error(error)
				}
			})
			fromSpots.forEach((fromSpot) => {
				const length = Math.sqrt((fromSpot.coords.x - toSpotItem?.toSpot.coords.x) ** 2
					+ (fromSpot.coords.y - toSpotItem?.toSpot.coords.y) ** 2)
				const duration = 2.2 + length * 0.01
				durations.push(duration)
			})
			const avgDuration =
				(durations.reduce((acc, next) => acc + next, 0) / durations.length).toFixed(2)

			store.activeToSpots.set(toId, {
				toSpot: spots.value.get(toId)!,
				hslColor: store.activeToSpots.size == 0 ? '52' : (Math.random() * 359).toFixed(0),
				avgDuration: avgDuration,
				lineupIds: renderToSpots.value.get(toId)!.lineupIds,
			})
		} else {
			store.activeToSpots.delete(toId)
		}
	}
}

/* RENDER TOSPOTS */
/* Почему добавлять активные споты лучше в отдельный массив, а не помечать флажками,
такими как isActive или isSelected внутри каждого?
Потому что в таком случае придется искать среди всех toСпотов те у которых есть этот флажок.
Например, если мы хотим отрисовать лайнапы только для активных toСпотов, то нам нужно сделать
computed на основе всех toСпотов, т.е. при каждой активации спота будет совершен проход
по всем toСпотам. Засунув активный спот в отдельный массив, для отрисовки нужных лайнапов
мы итерируемся только по этому массиву. */

/* TOSPOT ПОКАЗЫВАЕТСЯ, ЕСЛИ ПОДХОДИТ ПО ФИЛЬРАМ **ХОТЯ БЫ ОДИН** СВЯЗАННЫЙ С НИМИ ЛАЙНАП
(А ЛАЙНАПОВ СВЯЗАННЫХ С НИМ - НЕСКОЛЬКО)
ТО ЕСТЬ ОТОБРАЖЕНИЕ **КОНКРЕТНОГО** ЛАЙНАПА НЕ МОЖЕТ БЫТЬ СВЯЗАНО С ОТОБРАЖЕНИЕМ toСПОТА.
То есть то что сам toSpot подходит по фильтрам не значит, что все связанные с ним лайнапы
подходят по фильтрам. Это значит, что вне зависимости от фильтров будут отрисованы все связанные 
toSpotы.
Поэтому сами лайнапы тоже необходимо фильтровать. Попробовать сделать это можно двумя способами:
1) Отрисовать все лайнапы и включать только подходящие по фильтру с помощью v-if/v-show
2) Добавлять в toSpot ...  */
/* 3) Я ПОХОДУ КОНЧ. ВЕДЬ МНЕ ВООБЩЕ НЕ НУЖНА УСЛОВНАЯ ОТРИСОВКА ДЛЯ ЛАЙНАПОВ,
т.к. лайнапы появляются, когда  */
const renderToSpots = computed(() => {
	/* В один спот может прилетать несколько разных лайнапов. Информацию о каждом
	нужно хранить в этом споте для условной отрисовки на основе фильтров */

	/* На 1 лайнап делать 1 спот - нельзя, т.к. споты будут наслаиваться на миникарте, если
	у 2 и более лайнапов один и тот же toSpot. */

	/* По сути renderToSpots содержит в себе все возможные точки, куда летят гранаты.
	В template нужно только показать нужные на основе фильтров  */

	/* Из renderToSpots я выбираю спот нажатием кнопки и делаю его активным
	(помещаю в activeSpots) */
	const res = new Map<Spot['spotId'], {
		toSpot: Spot,
		filter: {
			nadeType: Set<NadeType>, side: Set<Side>, tickrate: Set<Tickrate>, difficulties: Set<Difficulty>,
		},
		lineupIds: Lineup['lineupId'][],
	}>()
	lineups.value.forEach((lineup) => {
		if (!res.has(lineup.toId)) {
			const toSpot = spots.value.get(lineup.toId)!
			res.set(lineup.toId, {
				toSpot: toSpot,
				lineupIds: [lineup.lineupId],
				filter: {
					nadeType: new Set([lineup.nadeType]),
					side: new Set([lineup.side]),
					tickrate: new Set([lineup.tickrate]),
					difficulties: new Set([lineup.difficulty]),
					// onewaySmokeOption:[],
					// fakeSmokeOption:[],
					// bugSmokeOption:[],
					// forWhom:[],
					// onewayMolotovOption:[],
					// fakeMolotovOption:[],
					// bugMolotovOption:[],
					// bugHeOption:[],
				}
			})
		} else {
			const toSpot = res.get(lineup.toId)!
			toSpot.lineupIds.push(lineup.lineupId)
			toSpot.filter.nadeType.add(lineup.nadeType)
			toSpot.filter.side.add(lineup.side)
			toSpot.filter.tickrate.add(lineup.tickrate)
			toSpot.filter.difficulties.add(lineup.difficulty)
			res.set(lineup.toId, toSpot)
		}
	})
	return res
})

/* ACTIVE LINEUPS */
const activeLineups = computed(() => {
	const res: Set<Lineup> = new Set()
	store.activeToSpots.forEach((activeToSpotItem, activeToSpotId) => {
		activeToSpotItem.lineupIds.forEach((lineupId) => {
			console.log(lineupId);
			const activeLineup = lineups.value.get(lineupId)!
			if (!selectedLineups.value.has(activeLineup)) {
				/*  */
				res.add(activeLineup)
			}
		})
	})
	return res
})
/* SELECTED LINEUPS */
const selectedLineups = computed(() => {
	const res: Set<Lineup> = new Set()
	store.selectedToSpots.forEach((selectedToSpotItem, selectedToSpotId) => {
		selectedToSpotItem.lineupIds.forEach((lineupId) => {
			console.log(lineupId);
			const selectedLineup = lineups.value.get(lineupId)!
			/*  */
			res.add(selectedLineup)
		})
	})
	return res
})

/* ACTIVE FROM SPOTS */
const activeFromSpots = computed(() => {
	/* Сохраняет id лайнапов в Set */
	const res = new Map<Spot['spotId'], {
		fromSpot: Spot,
		lineupIds: Set<Lineup['lineupId']>, /* Лайнапов к одному fromСпоту 
		может быть несколько, когда включено несколько toСпотов */
		filter: {
			nadeType: Set<NadeType>, side: Set<Side>, tickrate: Set<Tickrate>, difficulties: Set<Difficulty>,
		},
	}>()
	activeLineups.value.forEach((activeLineup) => {
		if (!res.has(activeLineup.fromId)) {
			const newFromSpot = spots.value.get(activeLineup.fromId)!
			res.set(activeLineup.fromId, {
				fromSpot: newFromSpot,
				lineupIds: new Set([activeLineup.lineupId]),
				filter: {
					nadeType: new Set([activeLineup.nadeType]),
					side: new Set([activeLineup.side]),
					tickrate: new Set([activeLineup.tickrate]),
					difficulties: new Set([activeLineup.difficulty]),
				}
			})
		} else {
			const existingFromSpot = res.get(activeLineup.fromId)!
			existingFromSpot.lineupIds.add(activeLineup.lineupId)
			existingFromSpot.filter.nadeType.add(activeLineup.nadeType)
			existingFromSpot.filter.side.add(activeLineup.side)
			existingFromSpot.filter.tickrate.add(activeLineup.tickrate)
			existingFromSpot.filter.difficulties.add(activeLineup.difficulty)
			res.set(activeLineup.fromId, existingFromSpot)
		}
	})
	return res
})

function onFromSpotSelect(activeFromSpotId: string) {
	const activeFromSpot = activeFromSpots.value.get(activeFromSpotId)!
	/* Если из этого спота летит несколько лайнапов, то нужно
	выбрать один конкретный */
	if (activeFromSpot?.lineupIds.size == 1) {
		const lineupId = activeFromSpot.lineupIds.values().next().value
		activeLineups.value.forEach((activeLineup) => {
			if (activeLineup.lineupId === lineupId) {
				const activeToSpot = store.activeToSpots.get(activeLineup.toId)!
				store.selectedToSpots.set(activeToSpot?.toSpot.spotId, activeToSpot)
				store.activeToSpots.delete(activeToSpot?.toSpot.spotId)
			}
		})
	}

	if (activeFromSpot?.lineupIds.size > 1) {
		console.log("> 1");
	}
}

// 'hsl(' + (Math.random() * 359).toFixed(0) + ', 88%, 56%)'
// 'hsl(52, 88%, 56%)'
// const l2r = spotX < nadeX ? true : false
type SvgItem = {
	nadeX: number,
	nadeY: number,
	spotX: number,
	spotY: number,
	duration: number | undefined,
	l2r: boolean,
	colorStr: string
}

const renderToSpots2 = computed(() => {
	/* В один спот может прилетать несколько разных лайнапов. Информацию о каждом
	нужно хранить в этом споте для условной отрисовки на основе фильтров */

	/* На 1 лайнап делать 1 спот - нельзя, т.к. споты будут наслаиваться на миникарте, если
	у 2 и более лайнапов один и тот же toSpot. */

	/* По сути renderToSpots содержит в себе все возможные точки, куда летят гранаты.
	В template нужно только показать нужные на основе фильтров  */

	/* Из renderToSpots я выбираю спот нажатием кнопки и делаю его активным
	(помещаю в activeSpots) */
	const res = new Map<Spot['spotId'], {
		toSpot: Spot,
		filter: {
			nadeType: Set<NadeType>, side: Set<Side>, tickrate: Set<Tickrate>, difficulties: Set<Difficulty>,
		},
		lineupIds: Lineup['lineupId'][],
		isActive: boolean,
		isSelected: boolean,
		activeLineupsIds: Lineup['lineupId'][],
		selectedLineupsIds: Lineup['lineupId'][]
	}>()
	lineups.value.forEach((lineup) => {
		if (!res.has(lineup.toId)) {
			const toSpot = spots.value.get(lineup.toId)!
			res.set(lineup.toId, {
				toSpot: toSpot,
				lineupIds: [lineup.lineupId],
				filter: {
					nadeType: new Set([lineup.nadeType]),
					side: new Set([lineup.side]),
					tickrate: new Set([lineup.tickrate]),
					difficulties: new Set([lineup.difficulty]),
					// onewaySmokeOption:[],
					// fakeSmokeOption:[],
					// bugSmokeOption:[],
					// forWhom:[],
					// onewayMolotovOption:[],
					// fakeMolotovOption:[],
					// bugMolotovOption:[],
					// bugHeOption:[],
				},
				isActive: false,
				isSelected: false,
				activeLineupsIds: [],
				selectedLineupsIds: []
			})
		} else {
			const toSpot = res.get(lineup.toId)!
			toSpot.lineupIds.push(lineup.lineupId)
			toSpot.filter.nadeType.add(lineup.nadeType)
			toSpot.filter.side.add(lineup.side)
			toSpot.filter.tickrate.add(lineup.tickrate)
			toSpot.filter.difficulties.add(lineup.difficulty)
			res.set(lineup.toId, toSpot)
		}
	})
	return res
})
</script>

<template>
	<!-- Внешний wrapper понадобился, т.к. panzoom вешает за каким-то хуем -->
	<!-- слушатели на родителя, т.е. на wrapperinner. Из-за этого, сквозь братские  -->
	<!-- для цели panzoom(в этом случае братские для mapContainer-outer) элементы  -->
	<!-- проходят все события(click,drag,scroll и тд) от самой цели. То есть -->
	<!-- драг миникарты работает сквозь этот sibling(братский)-элемент  -->
	<div class="wrapperOuter">
		<div class="wrapperInner">
			<div class="mapContainer-outer" ref="outerContainerRef" @wheel="">
				<main class="mapContainer-inner" ref="innerContainerRef"
					@mousedown="isDragging = false" @mousemove="isDragging = true">
					<CMS />
					<img ref="imgRef" @load="onImageLoaded"
						@error="onImageLoadError" class="mapImg" :src="
							currentRoute.length > 1
								? `/src/assets/maps/webp/${currentRoute}.webp`
								: ''
						" :alt="imgMapError" />

					<template v-for="[toId, toItem] in renderToSpots">
						<Grenade @click="toggleNade($event, toId)" :toItem="toItem"
							ref="smokeSpritesRef" :pointSize="pointSize"
							:isToggled="store.activeToSpots.has(toItem.toSpot.spotId)"
							:isSelected="store.selectedToSpots.has(toItem.toSpot.spotId)"
							:filter="filterState" />

					</template>

					<!-- <template v-for="[toId, toItem] in renderToSpots">
																																											<Grenade @click="toggleNade($event, toId)"
																																												:spot="toItem.toSpot" ref="smokeSpritesRef"
																																												:pointSize="pointSize"
																																												:isToggled="store.activeToSpots.has(toItem.toSpot.spotId)"
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

					<template v-for="activeLineup in activeLineups">
						<div class="svgItemWrapper" v-show="(
							(activeLineup.nadeType === filterState.nadeType
								|| filterState.nadeType === 'all') &&
							filterState.side === activeLineup.side &&
							filterState.tickrate === activeLineup.tickrate &&
							filterState.difficulties.has(activeLineup.difficulty)
						)">
							<svg>
								<line
									:x1="`${activeFromSpots.get(activeLineup.fromId)?.fromSpot.coords.x}%`"
									:y1="`${activeFromSpots.get(activeLineup.fromId)?.fromSpot.coords.y}%`"
									:x2="`${store.activeToSpots.get(activeLineup.toId)?.toSpot.coords.x}%`"
									:y2="`${store.activeToSpots.get(activeLineup.toId)?.toSpot.coords.y}%`"
									:stroke="`hsl(${store.activeToSpots.get(activeLineup.toId)?.hslColor}, 88%, 56%)`" />
							</svg>
							<img ref="smokeexecIcon"
								src="@/assets/icons/smokeicon.png" alt=""
								class="smokeexecIcon" :style="{
									'--spotX': `${activeFromSpots.get(activeLineup.fromId)?.fromSpot.coords.x}%`,
									'--spotY': `${activeFromSpots.get(activeLineup.fromId)?.fromSpot.coords.y}%`,
									'--nadeX': `${store.activeToSpots.get(activeLineup.toId)?.toSpot.coords.x}%`,
									'--nadeY': `${store.activeToSpots.get(activeLineup.toId)?.toSpot.coords.y}%`,
									'--duration':
										`${store.activeToSpots.get(activeLineup.toId)?.avgDuration}s`,
									'--rotate-from': `${-Math.random() * 72 * 10 - Math.random() * 270}deg`,
									'--rotate-to': `${Math.random() * 72 * 10}deg`,
									filter: `hue-rotate(${Number(store.activeToSpots.get(activeLineup.toId)?.hslColor) + 360 - 40}deg) sepia(33%)`
								}">
						</div>
					</template>

					<template
						v-for="[activeFromId, activeFromItem] in activeFromSpots">
						<FromSpot :fromSpotItem="activeFromItem" v-show="(
							(activeFromItem.filter.nadeType.has(filterState.nadeType)
								|| filterState.nadeType === 'all') &&
							activeFromItem.filter.side.has(filterState.side) &&
							activeFromItem.filter.tickrate.has(filterState.tickrate)
							// activeFromItem.filter.difficulties.has( filterState.difficulties)
						)" @myclick="onFromSpotSelect(activeFromId)" />
					</template>

				</main>
			</div>
		</div>
		<FilterPanel v-bind="{
			isFiltersVisible,
			filtersPropData,
			filterState
		}" @toggle="toggleFilters" @changeNadeType="filterHandlers.changeNadeType"
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
			@changeBugHe="filterHandlers.changeBugHe" />
	</div>


	<Teleport to="body">
		<Loading_goldsource v-if="isLoading" :nSegmentsVisible="nSegmentsVisible">
			<template #title>
				Loading...
			</template>
			<template #message>
				Downloading de_{{ currentRoute }} image...
			</template>
		</Loading_goldsource>
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
	box-shadow: -1px -1px 0 0 var(--border_dark),
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
	z-index: 1;
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

svg {
	position: absolute;
	z-index: 2;
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
}

.smokeexecIcon {
	display: block;
	position: absolute;
	translate: -50% -50%;
	animation: execution var(--duration) linear infinite;
	height: 16px;
	z-index: 3;
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
