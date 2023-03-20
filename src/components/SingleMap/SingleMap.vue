<script lang="ts" setup>
import { ref, computed, watch, onMounted, type StyleValue, reactive } from "vue";
import { useRoute } from 'vue-router'
import { useSomestore } from "@/stores/somestore";
import Smoke from "@/components/SingleMap/Smoke.vue"
import Molotov from "@/components/SingleMap/Molotov.vue"
import Flash from "@/components/SingleMap/Flash.vue"
import He from "@/components/SingleMap/He.vue"
import CMS from "@/components/cms/CMS.vue";
import FilterPanel from "@/components/SingleMap/FilterPanel.vue"
import panzoom from "panzoom"

import { mirageGrenades } from "@/data/mirageGrenades";
import { ancientGrenades } from "@/data/ancientGrenades";
import { dust2Grenades } from "@/data/dust2Grenades";
import { infernoGrenades } from "@/data/infernoGrenades";
import { nukeGrenades } from "@/data/nukeGrenades";
import { overpassGrenades } from "@/data/overpassGrenades";
import { vertigoGrenades } from "@/data/vertigoGrenades";

import { useLoadingGoldsourceLogic } from "@/components/Loading_goldsource/loading_goldsource"
import { maplist } from "@/data/maplist"
import type { MapItems } from "@/data/types/MapItems"
import { nadeTypeList } from "@/data/nadeTypeList";
import type { ForWhom } from "@/data/types/GrenadeProperties";
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
		return { smokes: [], flashes: [], molotovs: [], hes: [], throwSpots: [] } as MapItems
	}
})
// Сделал каждой гранате текущей карты по computed для визуального облегчения template
const smokes = computed(() => currentRouteMapItems.value.smokes)
const molotovs = computed(() => currentRouteMapItems.value.molotovs)
const flashes = computed(() => currentRouteMapItems.value.flashes)
const hes = computed(() => currentRouteMapItems.value.hes)
const throwSpots = computed(() => currentRouteMapItems.value.throwSpots)



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
function onImageLoaded() {
	store.isFirstLoadTrue()
	// console.log("%cimage loaded", "color:green", performance.now());
	endLoading()
	let mapside = getElemSide(imgRef.value!)
	let mapCoefd = mapside * pxCoef
	if (mapside > 450) {
		pointSide.value = Math.ceil(mapCoefd * 10) // 10px это по дефолту(пересчитываю этот размер для ресайза)
	} else {
		pointSide.value = Math.ceil(mapCoefd * 10) // 10px это по дефолту(пересчитываю этот размер для ресайза)
		// pointSide.value = Math.ceil(mapCoefd) * 10
	}
	smokeShadow.value = `box-shadow: 0 0 ${Math.ceil(mapCoefd * 5)}px ${Math.ceil(mapCoefd * 2)}px rgba(0, 0, 0, 0.4), 0 0 ${Math.ceil(mapCoefd * 5)}px ${Math.ceil(mapCoefd * 12)}px rgba(237, 237, 237, 0.7)`
}



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
const imgRef = ref(null)
const pointSide = ref(0)
const smokeShadow = ref('')
const pxCoef = 0.0016155 // пропорция 1px к размеру карты
function getElemSide(elem: HTMLDivElement) {
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

	// Карта 619x619, точка 10x10, коэф 619/10 = 61.9
})



const isFiltersVisible = ref(false)
const toggleFilters = () => { isFiltersVisible.value = !isFiltersVisible.value }
nadeTypeList.unshift('All')
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
const changeNadeType = (newVal: any) => {
	filterState.nadeType = newVal
}
const changeSide = (newVal: any) => {
	filterState.side = newVal
}
const changeTickrate = (newVal: any) => {
	filterState.tickrate = newVal
}
const changeDifficulty = (newVal: any, option: string) => {
	filterState.difficultiesState[`${option}Visible` as keyof typeof filterState.difficultiesState] = newVal
	console.log(filterState.difficultiesState[`${option}Visible` as keyof typeof filterState.difficultiesState]);
}
const changeOnewaySmoke = (newVal: any) => {
	filterState.onewaySmokeOption = newVal
}
const changeFakeSmoke = (newVal: any) => {
	filterState.fakeSmokeOption = newVal
}
const changeBugSmoke = (newVal: any) => {
	filterState.bugSmokeOption = newVal
}
const changeForWhom = (newVal: any) => {
	filterState.forWhom = newVal
}
const changeOnewayMolotov = (newVal: any) => {
	filterState.onewayMolotovOption = newVal
}
const changeFakeMolotov = (newVal: any) => {
	filterState.fakeMolotovOption = newVal
}
const changeBugMolotov = (newVal: any) => {
	filterState.bugMolotovOption = newVal
}
const changeBugHe = (newVal: any) => {
	filterState.bugHeOption = newVal
}
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
				<main class="mapContainer-inner" ref="innerContainerRef">
					<CMS />
					<img ref="imgRef" @load="onImageLoaded"
						@error="onImageLoadError" class="mapImg" :src="
							currentRoute.length > 1
								? `/src/assets/maps/webp/${currentRoute}.webp`
								: ''
						" :alt="imgMapError" />
					<template v-for="smoke in smokes">
						<Smoke :smoke="smoke" :pointSide="pointSide"
							:smokeShadow="smokeShadow"
							:nadeType="filterState.nadeType"
							:side="filterState.side"
							:tickrate="filterState.tickrate"
							:difficultiesState="filterState.difficultiesState"
							:onewayOption="filterState.onewaySmokeOption"
							:fakeOption="filterState.fakeSmokeOption"
							:bugOption="filterState.bugSmokeOption" />
					</template>
					<template v-for="molotov in molotovs">
						<Molotov :molotov="molotov"
							:nadeType="filterState.nadeType"
							:side="filterState.side"
							:tickrate="filterState.tickrate"
							:difficultiesState="filterState.difficultiesState"
							:onewayOption="filterState.onewayMolotovOption"
							:fakeOption="filterState.fakeMolotovOption"
							:bugOption="filterState.bugMolotovOption" />
					</template>
					<template v-for="flash in flashes">
						<Flash :flash="flash" :nadeType="filterState.nadeType"
							:side="filterState.side"
							:tickrate="filterState.tickrate"
							:difficultiesState="filterState.difficultiesState"
							:forWhom="filterState.forWhom" />
					</template>
					<!-- <template v-for="he in hes">
																				<He :he="he" v-show="
																					(filterState.nadeType === 'All' ||
																						filterState.nadeType === 'He') &&
																					filterState.side === he.side &&
																					filterState.tickrate === he.tickrate &&
																					filterState.difficultiesState[`${he.difficulty}Visible`]" />
																			</template> -->
				</main>
			</div>
		</div>
		<FilterPanel v-bind="{
			isFiltersVisible,
			filtersPropData,
			filterState
		}" @toggle="toggleFilters" @changeNadeType="changeNadeType"
			@changeSide="changeSide" @changeTickrate="changeTickrate"
			@changeDifficulty="changeDifficulty"
			@changeOnewaySmoke="changeOnewaySmoke"
			@changeFakeSmoke="changeFakeSmoke" @changeBugSmoke="changeBugSmoke"
			@changeForWhom="changeForWhom"
			@changeOnewayMolotov="changeOnewayMolotov"
			@changeFakeMolotov="changeFakeMolotov"
			@changeBugMolotov="changeBugMolotov" @changeBugHe="changeBugHe" />
	</div>


	<Teleport to="body">
		<Loading_goldsource v-if="isLoading"
			:nSegmentsVisible="nSegmentsVisible">
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
	border: 3px solid yellow;
	display: flex;
	flex-direction: column;
}

.mapContainer-inner {
	position: relative;
	border: 15px solid var(--bg_dark);
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
		border: 5px solid rgb(0, 89, 255);
		background-color: var(--bg_dark);
		text-align: center;
		pointer-events: none;
	}
}
</style>
