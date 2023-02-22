<script lang="ts" setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from 'vue-router'
import { useSomestore } from "@/stores/somestore";
import Smoke from "@/components/SingleMap/Smoke/SmokeComponent.vue"
import Molotov from "@/components/SingleMap/Molotov/MolotovComponent.vue"
import Flash from "@/components/SingleMap/Flash/FlashComponent.vue"
import He from "@/components/SingleMap/He/HeComponent.vue"
import panzoom from "panzoom"

import { mirageGrenades } from "@/data/mirageGrenades";
import { ancientGrenades } from "@/data/ancientGrenades";
import { dust2Grenades } from "@/data/dust2Grenades";
import { infernoGrenades } from "@/data/infernoGrenades";
import { nukeGrenades } from "@/data/nukeGrenades";
import { overpassGrenades } from "@/data/overpassGrenades";
import { vertigoGrenades } from "@/data/vertigoGrenades";

import { maplist } from "@/maplist"
import { useLoadingGoldsourceLogic } from "@/components/Loading_goldsource/loading_goldsource"
import cmsOverlay from "../cms/cmsOverlay.vue";
import type { GrenadeCollection } from "@/data/types/GrenadeCollection";
const { isLoading, nSegmentsVisible, startLoading, endLoading, onImageLoadError } = useLoadingGoldsourceLogic()
const store = useSomestore()
const route = useRoute()
const currentRoute = computed(() => route.path.slice(1))
/* Возможно нужно вынести склеивание этого объекта в отдельный файл и импортировать его,
если склеивание происходит каждый раз при загрузке приложения.*/
const allMapsGrenadeCollections: any = {
	mirageGrenades,
	ancientGrenades,
	dust2Grenades,
	infernoGrenades,
	nukeGrenades,
	overpassGrenades,
	vertigoGrenades
}
const currentMapGrenadeCollection = computed(() => {
	if (maplist.includes(currentRoute.value)) {
		return allMapsGrenadeCollections[`${currentRoute.value}Grenades`] as GrenadeCollection
	} else {
		return {
			smokes: [], flashes: [], molotovs: [], hes: [],
		}
	}
})
// Сделал каждой текущей гранате по computed для визуального облегчения template
const smokes = computed(() => currentMapGrenadeCollection.value.smokes)
const molotovs = computed(() => currentMapGrenadeCollection.value.molotovs)
const flashes = computed(() => currentMapGrenadeCollection.value.flashes)
const hes = computed(() => currentMapGrenadeCollection.value.hes)

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
	console.log("%cimage loaded", "color:green", performance.now());
	endLoading()
	preloadRestImages()
}
/* Т.к. пользователь может при первом заходе открыть любую из карт, можно просто
попытаться подгрузить все карты и пикча текущей карты загружена не будет т.к.
браузер увидит, что она есть в кэше => функционал для отслеживания уже загруженных карт не нужен */
async function preloadRestImages() {
	maplist.forEach((map) => {
		let img = new Image()
		img.src = `/src/assets/maps/webp/${map}.webp`
		img.onload = (e) => { console.log(`%c ${map} image loaded`, "color:blue") }
	})
}
const innerContainerRef = ref<HTMLDivElement | null>(null)
onMounted(() => {
	panzoom(innerContainerRef.value as HTMLDivElement, {
		maxZoom: 3,
		minZoom: 1,
		bounds: true,
		zoomDoubleClickSpeed: 1
	})
})
</script>

<template>
	<div class="mapContainer-outer">
		<div class="mapContainer-inner" ref="innerContainerRef" @wheel.prevent>
			<div class="cmsShadowMap" v-if="store.isCmsModeOn" @click="">

			</div>
			<img @load="onImageLoaded" @error="onImageLoadError" class="mapImg" :src="
				currentRoute.length > 1
					? `/src/assets/maps/webp/${currentRoute}.webp`
					: ''
			" :alt="imgMapError" />
			<Smoke v-for="smoke in smokes" :smoke="smoke" />
			<Molotov v-for="molotov in molotovs" :molotov="molotov" />
			<Flash v-for="flash in flashes" :flash="flash" />
			<He v-for="he in hes" :he="he" />
		</div>
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
		<cmsOverlay>
		</cmsOverlay>
	</Teleport>
</template>

<style lang="scss" scoped>
.cmsShadowMap {
	background-color: rgba(38, 0, 255, 0.133);
	width: 100%;
	height: 100%;
	position: absolute;
}

.mapContainer-outer {
	overflow: hidden;
	position: relative; // "offsetX/Y are the position of the mouse relatively to the 'closest positioned element'"
	background-color: var(--bg_dark);
	box-shadow: -1px -1px 0 0 var(--border_dark),
		1px 1px 0 0 var(--border_light);
	// cursor: grab;
}

.mapContainer-inner {
	min-height: 0;
	margin: 0 auto;
	max-height: 100%;
	aspect-ratio: 1/1;
	display: flex;
	border: 5px solid orange;
	border: 15px solid var(--bg_dark);
	position: relative;

	.mapImg {
		// border: 5px solid yellow;
		max-width: 100%;
		max-height: 100%;
		// aspect-ratio: 1/1;
		background-color: var(--bg_dark);
		text-align: center;
		pointer-events: none;
	}
}
</style>
