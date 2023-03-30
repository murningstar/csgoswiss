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
import ThrowSpotComponent from "@/components/SingleMap/ThrowSpot.vue"
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
import type { ForWhom } from "@/data/types/GrenadeProperties";
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


/* Т.к. пользователь может при первом заходе открыть любую из карт, можно просто
попытаться подгрузить все карты и пикча текущей карты загружена не будет т.к.
браузер увидит, что она есть в кэше => функционал для отслеживания уже загруженных карт не нужен */
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
	nadeType: 'Smoke',
	side: 't',
	tickrate: 128,
	difficultiesState: {
		easyVisible: true,
		normalVisible: true,
		mediumVisible: true,
		hardVisible: true,
		pixelPerfectVisible: true,
	},
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
	console.log(newval.nadeType);
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
	changeDifficulty: (newVal: any, option: string) => {
		filterState.difficultiesState[`${option}Visible` as keyof typeof filterState.difficultiesState] = newVal
		console.log(filterState.difficultiesState[`${option}Visible` as keyof typeof filterState.difficultiesState]);
	},
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

function toggleNade(event: Event, toId: Spot['spotId']) {
	if (isDragging.value == false &&
		(event.target as HTMLButtonElement).tagName == 'BUTTON') {

		if (!store.activeToSpots.has(toId)) {
			store.activeToSpots.set(toId, {
				toSpot: spots.value.get(toId)!,
				hslColor: store.activeToSpots.size == 0 ? '50' : (Math.random() * 359).toFixed(0),
				lineupIds: toSpots.value.get(toId)!.lineupIds
			})
		} else {
			store.activeToSpots.delete(toId)
		}
		// if (!store.activeGrenadeItems.has(toId)) {
		// 	store.activeGrenadeItems.set(toId, {
		// 		toSpot: ,
		// 		colorStr: (Math.random() * 359).toFixed(0),
		// 		selectedSpots: []
		// 	})
		// } else {
		// 	store.activeGrenadeItems.delete(smoke.id)
		// }
	}
}

/* 
***************************************************************************************************
Если у меня есть две гранаты, у которых есть один общий спот, то НЕЛЬЗЯ СДЕЛАТЬ ФУНКЦИОНАЛ ДЛЯ
одновременного выбора спотов для обеих сразу, т.к. при нажатии на их общий спот непонятно
---
Еще мысль: 
Добавление спотов в Map, а не в Array приводит к потере связи того, какая именно граната
вызвала показываение спота, если две разных гранаты кидаются из одного спота

***************************************************************************************************
*/
// spots и lineups
const lineupBased_toSpots = computed(() => {
	const res = new Map<Spot['spotId'], { toSpot: Spot, lineups: Map<Lineup['lineupId'], [Lineup, Spot]> }>()
	lineups.value.forEach((lineup) => {
		if (res.has(lineup.toId)) {
			const existingToSpot = res.get(lineup.toId)
			const fromSpot = spots.value.get(lineup.fromId)!
			existingToSpot!.lineups.set(lineup.lineupId, [lineup, fromSpot])
			res.set(lineup.toId, existingToSpot!)
		}
		else {
			const toSpot = spots.value.get(lineup.toId)!
			const fromSpot = spots.value.get(lineup.fromId)!
			res.set(toSpot!.spotId, {
				toSpot: toSpot,
				lineups: new Map([
					[lineup.lineupId, [lineup, fromSpot]]
				])
			})
		} 5
	})
	return res
})

type toSpotItem = {
	toSpot: Spot,
	lineupIds: Lineup['lineupId'][]
}
const toSpots = computed(() => {
	const res = new Map<Spot['spotId'], toSpotItem>()
	lineups.value.forEach((lineup) => {
		if (!res.has(lineup.toId)) {
			const toSpot = spots.value.get(lineup.toId)!
			res.set(lineup.toId, {
				toSpot: toSpot,
				lineupIds: [lineup.lineupId]
			})
		} else {
			const toSpot = res.get(lineup.toId)!
			toSpot.lineupIds.push(lineup.lineupId)
			res.set(lineup.toId, toSpot)
		}
	})
	return res
})
const activeLineups = computed(() => {
	const res: Lineup[] = []
	store.activeToSpots.forEach((activeToSpotItem, activeToSpotId) => {
		activeToSpotItem.lineupIds.forEach((lineupId) => {
			console.log(lineupId);
			const activeLineup = lineups.value.get(lineupId)!
			res.push(activeLineup)
		})
	})
	return res
})
const activeFromSpots = computed(() => {
	const res = new Map<Spot['spotId'], {
		fromSpot: Spot,
		lineupIds: Lineup['lineupId'][]
	}>()
	activeLineups.value.forEach((activeLineup) => {
		if (!res.has(activeLineup.fromId)) {
			const fromSpot = spots.value.get(activeLineup.fromId)!
			res.set(activeLineup.fromId, {
				fromSpot: fromSpot,
				lineupIds: [activeLineup.lineupId]
			})
		} else {
			const fromSpot = res.get(activeLineup.toId)!
			fromSpot.lineupIds.push(activeLineup.lineupId)
			res.set(activeLineup.toId, fromSpot)
		}
	})
	return res
})

watch(activeFromSpots, (nv) => {
	console.log(nv);
})
// const selectableSpots = computed(() => {
// 	const res = new Map<ThrowSpot['id'], {
// 		throwSpot: ThrowSpot,
// 	}>()
// 	store.activeGrenadeItems.forEach((grenadeItem) => {
// 		if (grenadeItem.selectedSpots.length < 1) {
// 			grenadeItem.grenade.throwSpotsIds.forEach((spotId) => {
// 				const spot = throwSpots.value.get(spotId)
// 				// if (!selectedSpots.has(spotId)) {
// 				// 	res.set(spotId, spo t)
// 				// }
// 				if (!store.activeGrenadeItems.has(spotId)) {
// 					res.set(spotId, spot)
// 				}
// 			})
// 		}
// 	})
// 	return res
// })

// function onSpotClick(event: Event, id: string, throwSpot: ThrowSpot) {
// 	const nade = store.activeGrenadeItems.get(id);
// 	if (!store.activeGrenadeItems.has(id)) {
// 		nade?.selectedSpots.push(throwSpot)
// 	}
// }


// // const selectedSpots = reactive(new Map<ThrowSpot['id'], ThrowSpot>())


// const lineUps = 
// watch(selectableSpots, (nv) => {
// 	console.log(nv);
// })
/* // Когда-то потом нужно будет добавить коллекцию Selected Spots и на ее основе
// выбирать что именно вставлять в res (selectableSpotsAndSvgItems)
const selectableSpotsAndSvgItems = computed(() => {
	// ключ-spotId, значение - [ThrowSpot,SvgItem]
	const res = new Map<string, [ThrowSpot, SvgItem]>()
	if (store.activeGrenades.size > 0) {
		store.activeGrenades.forEach((value, aNadeId) => {
			const aNade = value[0]
			const aNadeColor = value[1]
			const aSpotsArray: ThrowSpot[] = []
			const aSpotSvgitemArray: SvgItem[] = []
			const durations: number[] = []
			aNade.throwSpotsIds.forEach((throwSpotId, index) => {
				const spot = throwSpots.value.find((ts) => ts.id == throwSpotId)
	
				const spotX = spot!.coords.y
				const spotY = spot!.coords.y
				const aNadeX = aNade.coords.x
				const aNadeY = aNade.coords.y
				const length = Math.sqrt((spotX - aNadeX) ** 2 + (spotY - aNadeY) ** 2)
				const l2r = spotX < aNadeX ? true : false
				const ownDuration = 2.2 + length * 0.01
				durations.push(ownDuration)
	
				aSpotSvgitemArray.push({
					nadeX: aNadeX,
					nadeY: aNadeY,
					spotX,
					spotY,
					l2r,
					colorStr: aNadeColor,
					duration: undefined // avgDuration потом
				})
			})
			const aNade_AvgDuration = Number((durations.reduce((acc, next) => {
				return acc + next
			}, 0) / durations.length).toFixed(2))
	
	
			// map.set(throwSpotId, throwSpots.value.find((ts) => ts.id == throwSpotId))
		})
	
	}
	return res
}) */

// const svgArr = computed(() => {
// 	const res:any = []
// 	store.activeGrenades.forEach((grenade, grenadeId) => {
// 		const grenadeSpots:[] = [];
// 		const durations:number[] = []
// 		grenade.throwSpotsIds.forEach((spotId) => {
// 			const spot = selectableSpotsAndSvgItems.value.get(spotId)
// 			const nadeX = grenade.coords.x
// 			const nadeY = grenade.coords.y
// 			const spotX = spot.coords.y
// 			const spotY = spot.coords.y
// 			const length = Math.sqrt((spotX - nadeX) ** 2 + (spotY - nadeY) ** 2)
// 			const l2r = spotX < nadeX ? true : false
// 			const duration = 2.2 + length * 0.01
// 			durations.push(duration)
// 			const svgItem = { 
// 				spot, 
// 				nadeX, 
// 				nadeY, 
// 				spotX, 
// 				spotY, 
// 				length, 
// 				l2r,
// 				duration: null,
// 				lineColor: null
// 			}
// 			grenadeSpots.push(svgItem)
// 		})
// 		const lineColor = 'hsl(' + (Math.random() * 359).toFixed(0) + ', 88%, 56%)'
// 		const avgDuration =
// 			(durations.reduce((acc, next) => acc + next, 0) / durations.length).toFixed(2)
// 		grenadeSpots.forEach((value) => {
// 			value.lineColor = lineColor
// 			value.duration = avgDuration
// 			res.push(...grenadeSpots)
// 		})
// 	})
// 	return res
// })

// 'hsl(52, 88%, 56%)'
//

type SvgItem = {
	nadeX: number,
	nadeY: number,
	spotX: number,
	spotY: number,
	duration: number | undefined,
	l2r: boolean,
	colorStr: string
}
// const svgArr = computed(() => {
// 	let svgArr: SvgItem[] = []
// 	if (store.activeGrenades.size > 0) {
// 		for (const [grenadeId, [grenade, colorStr]] of store.activeGrenades) {
// 			const nadeX = grenade.coords.x
// 			const nadeY = grenade.coords.y
// 			let durations: any[] = []
// 			let singleNadeLines: any[] = []
// 			grenade.throwSpotsIds.forEach((spotId) => {
// 				const spot = selectableSpotsAndSvgItems.value.get(spotId)
// 				const spotX = spot!.coords.x
// 				const spotY = spot!.coords.y
// 				const length = Math.sqrt((spotX - nadeX) ** 2 + (spotY - nadeY) ** 2)
// 				const duration = 2.2 + length * 0.01
// 				durations.push(duration)
// 				const l2r = spotX < nadeX ? true : false
// 				singleNadeLines.push({
// 					nadeX,
// 					nadeY,
// 					spotX,
// 					spotY,
// 					l2r,
// 					colorStr
// 				})
// 			})
// 			singleNadeLines.forEach((line) => {
// 				line.duration = (durations.reduce((acc, next) => {
// 					return acc + next
// 				}, 0) / durations.length).toFixed(2)
// 			})
// 			console.log(singleNadeLines);
// 			svgArr.push(...singleNadeLines)
// 		}
// 	}
// 	return svgArr
// })

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

					<template v-for="[toId, toItem] in toSpots">
						<Grenade :spot="toItem.toSpot" :pointSize="pointSize"
							@click="toggleNade($event, toId)"
							:isToggled="store.activeToSpots.has(toItem.toSpot.spotId)" />

						<template v-for="[lineupId, lineupItem] in toItem.lineups">
							<div class="svgItemWrapper">
								<svg>
									<line :x1="`${lineupItem[1].coords.x}%`"
										:y1="`${lineupItem[1].coords.y}%`"
										:x2="`${toItem.toSpot.coords.x}%`"
										:y2="`${toItem.toSpot.coords.y}%`"
										:stroke="`hsl(${(Math.random() * 359).toFixed(0)}, 88%, 56%)`" />
									<!-- :stroke="`hsl(${svgItem.colorStr}, 88%, 56%)`" /> -->
								</svg>
								<img ref="smokeexecIcon"
									src="@/assets/icons/smokeicon.png" alt=""
									class="smokeexecIcon" :style="{

										'--spotX': `${lineupItem[1].coords.x}%`,
										'--spotY': `${lineupItem[1].coords.y}%`,
										'--nadeX': `${toItem.toSpot.coords.x}%`,
										'--nadeY': `${toItem.toSpot.coords.y}%`,
										'--duration': `${2.5}s`,
										'--rotate-from': `${-Math.random() * 72 * 10
											- Math.random() * 270}deg`,
										'--rotate-to': `${Math.random() * 72 *
											10}deg`,

										// '--spotX': `${svgItem.spotX}%`,
										// '--spotY': `${svgItem.spotY}%`,
										// '--nadeX': `${svgItem.nadeX}%`,
										// '--nadeY': `${svgItem.nadeY}%`,
										// '--duration': `${svgItem.duration}s`,
										// '--rotate-from': `${-Math.random() * 72 * svgItem.duration
										// 	- Math.random() * 270}deg`,
										// '--rotate-to': `${Math.random() * 72 *
										// 	svgItem.duration}deg`,
										// '--rotate-from': '0',
										// '--rotate-to': '0',
										filter: `hue-rotate(${Number((Math.random() * 359).toFixed(0)) + 360 - 40}deg) sepia(33%)`,
									}">

							</div>
						</template>

					</template>

					<!-- <template v-for="[id, smoke] in smokes"> -->
					<!-- <SmokeComponent @click="onGrenadeClick($event, smoke)" -->
					<!-- :smoke="smoke" :pointSize="pointSize" -->
					<!-- :nadeType="filterState.nadeType" -->
					<!-- :side="filterState.side" -->
					<!-- :tickrate="filterState.tickrate" -->
					<!-- :difficultiesState="filterState.difficultiesState" -->
					<!-- :onewayOption="filterState.onewaySmokeOption" -->
					<!-- :fakeOption="filterState.fakeSmokeOption" -->
					<!-- :bugOption="filterState.bugSmokeOption" -->
					<!-- ref="smokeSpritesRef" -->
					<!-- :isSelected="store.activeGrenadeItems.has(smoke.id) ? true : false" /> -->
					<!-- </template> -->

					<!-- <template v-for="[id, molotov] in molotovs"> -->
					<!-- <MolotovComponent :molotov="molotov" -->
					<!-- :pointSize="pointSize" -->
					<!-- :nadeType="filterState.nadeType" -->
					<!-- :side="filterState.side" -->
					<!-- :tickrate="filterState.tickrate" -->
					<!-- :difficultiesState="filterState.difficultiesState" -->
					<!-- :onewayOption="filterState.onewayMolotovOption" -->
					<!-- :fakeOption="filterState.fakeMolotovOption" -->
					<!-- :bugOption="filterState.bugMolotovOption" /> -->
					<!-- </template> -->
					<!-- <template v-for="[id, flash] in flashes"> -->
					<!-- <FlashComponent :flash="flash" :pointSize="pointSize" -->
					<!-- :nadeType="filterState.nadeType" -->
					<!-- :side="filterState.side" -->
					<!-- :tickrate="filterState.tickrate" -->
					<!-- :difficultiesState="filterState.difficultiesState" -->
					<!-- :forWhom="filterState.forWhom" /> -->
					<!-- </template> -->
					<!-- <template v-for="he in hes"> -->
					<!-- <HeComponent :he="he" v-show=" -->
					<!-- (filterState.nadeType === 'All' || -->
					<!-- filterState.nadeType === 'He') && -->
					<!-- filterState.side === he.side && -->
					<!-- filterState.tickrate === he.tickrate && -->
					<!-- filterState.difficultiesState[`${he.difficulty}Visible`]" /> -->
					<!-- </template> -->


					<!-- <template v-for="[id, throwSpot] in "> -->
					<!-- <ThrowSpotComponent -->
					<!-- @click="onSpotClick($event, id, throwSpot)" -->
					<!-- v-show="selectableSpots.has(throwSpot.id)" -->
					<!-- :throwSpot="throwSpot" /> -->
					<!-- </template> -->



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
