<script setup lang="ts">
import type { Flash } from '@/data/_old/Flash';
import type { ForWhom, Side, Tickrate } from '@/data/types/GrenadeProperties';
import { reactive, computed } from 'vue';
const props = defineProps<{
	flash: Flash,
	nadeType: string,
	side: string,
	tickrate: number,
	difficultiesState: {
		easyVisible: boolean,
		normalVisible: boolean,
		mediumVisible: boolean,
		hardVisible: boolean,
		pixelPerfectVisible: boolean,
	},
	forWhom: string,
	pointSize: number,
}>()
const flash = reactive(props.flash)
const showIf = computed(() => {
	return (props.nadeType === 'All' || props.nadeType === 'Flash') &&
		props.side === flash.side &&
		props.tickrate === flash.tickrate &&
		props.difficultiesState[`${flash.difficulty}Visible` as keyof typeof props.difficultiesState]
})
</script>

<template>
	<div class="flashContainer" :style="{
		top: `${flash.coords.y}%`,
		left: `${flash.coords.x}%`,
		width: `${pointSize}px`,
		height: `${pointSize}px`,
	}"></div>
</template>

<style scoped>
.flashContainer {
	position: absolute;
	border-radius: 50%;
	aspect-ratio: 1;
	width: 1.6%;
	height: 1.6%;
	/* box-shadow: 0 0 10px rgb(255, 0, 0); */
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
	/* border: 1px rgb(0, 114, 0) solid; */
}
</style>