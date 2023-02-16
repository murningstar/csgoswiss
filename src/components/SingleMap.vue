<script lang="ts" setup>
import { ref, computed, watch } from "vue";
import { useRoute } from 'vue-router'
import { useSomestore } from "@/stores/somestore";
import points_mirage from "./maps/mirage/points_mirage.js";
import { maplist } from "@/maplist"
import { useLoadingGoldsourceLogic } from "@/composables/loading_goldsource"
const { isLoading, nSegmentsVisible, startLoading, endLoading } = useLoadingGoldsourceLogic()
const store = useSomestore()
const route = useRoute()
const points = ref(points_mirage);
const imgMapError = computed(() => {
	return `map ${route.path.slice(1)} downloading error, please refresh the page`
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
</script>

<template>
	<div>
		<img @load="onImageLoaded" class="mapImg" :src="
			$route.path.length > 1
				? `/src/assets/maps/webp/${$route.path.slice(1)}.webp`
				: ''
		" :alt="imgMapError" />
		<div class="pointContainer" v-for="point in points" :style="{
			top: `${point.position.y}%`,
			left: `${point.position.x}%`,
		}">
			<button></button>
			<img class="sprite" src="@/assets/smoke_sprite.webp" alt="Smoke effect image downloading error" />
		</div>
		<Teleport to="body">
			<Loading_goldsource v-if="isLoading" :nSegmentsVisible="nSegmentsVisible">
				<template #title>
					Loading...
				</template>
				<template #message>
					Downloading {{ $route.path.slice(1) }} map image...
				</template>
			</Loading_goldsource>
		</Teleport>
</div>
</template>

<style lang="scss" scoped>
.mapContainer {
	min-height: 0;
	margin: 0 auto;
	max-height: 100%;
	aspect-ratio: 1/1;
	display: flex;
	border: 5px solid orange;
	border: 15px solid var(--bg_dark);
	position: relative;
	box-shadow: -1px -1px 0 0 var(--border_dark),
		1px 1px 0 0 var(--border_light);

	.mapImg {
		// border: 5px solid yellow;
		max-width: 100%;
		max-height: 100%;
		// aspect-ratio: 1/1;
		background-color: var(--bg_dark);
		text-align: center;
	}
}

.pointContainer {
	position: absolute;
	border-radius: 50%;
	aspect-ratio: 1;
	width: 1.6%;
	height: 1.6%;
	// box-shadow: 0 0 10px rgb(255, 0, 0);
	background-color: rgb(0, 68, 255);
	border: 2px solid rgb(0, 68, 255);
	z-index: 2;
	transform: translate(-50%, -50%);
}

button {
	position: absolute;
	width: 100%;
	height: 100%;
	background-color: rgba(255, 0, 0, 0.452);
	cursor: pointer;
	// border: 1px rgb(0, 114, 0) solid;
}

.sprite {
	width: 50px;
	height: 50px;
	position: absolute;
	// border: 1px red solid;
	z-index: -1;
	opacity: 50%;
	// border: 2px red solid;
	transform: translate(-44%, -43%);
	// animation: rotateSprite 16s linear infinite;
	animation: rotateSprite 16s linear infinite,
		scaleSprite 5s ease-in-out infinite;
	transform-origin: 6% 7%;
}

@keyframes rotateSprite {
	from {
		rotate: 0deg;
	}

	to {
		rotate: 360deg;
	}
}

@keyframes scaleSprite {
	0% {
		scale: 0.95;
	}

	50% {
		scale: 1;
	}

	100% {
		scale: 0.95;
	}
}
</style>
