<script setup lang="ts">
import type { Molotov } from '@/data/interfaces/Motolov';
import { reactive, computed } from 'vue';
const props = defineProps<{
	molotov: Molotov,
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
	onewayOption: string,
	fakeOption: string,
	bugOption: string,
}>()
const molotov = reactive(props.molotov)
const showIf = computed(() => {
	return (props.nadeType === 'All' || props.nadeType === 'Molotov') &&
		props.side === molotov.side &&
		props.tickrate === molotov.tickrate &&
		props.difficultiesState[`${molotov.difficulty}Visible` as keyof typeof props.difficultiesState] &&
		(
			molotov.isOnewayMolotov === true && (
				props.onewayOption === 'Oneways only' ||
				props.onewayOption === 'All'
			) ||
			molotov.isOnewayMolotov === false && (
				props.onewayOption === 'Regular only' ||
				props.onewayOption === 'All'
			)
		) &&
		(
			molotov.isFakeMolotov === true && (
				props.fakeOption === 'FakeMolotovs only' ||
				props.fakeOption === 'All'
			) ||
			molotov.isFakeMolotov === false && (
				props.fakeOption === 'Regular only' ||
				props.fakeOption === 'All'
			)
		) &&
		(
			molotov.isFakeMolotov === true && (
				props.bugOption === 'BugMolotovs only' ||
				props.bugOption === 'All'
			) ||
			molotov.isFakeMolotov === false && (
				props.bugOption === 'Regular only' ||
				props.bugOption === 'All'
			)
		)
})
</script>

<template>
	<div class="molotovContainer" v-show="showIf" :style="{
		top: `${molotov.coords.y}%`,
		left: `${molotov.coords.x}%`,
	}">
		<button></button>
	</div>
</template>

<style scoped>
.molotovContainer {
	position: absolute;
	border-radius: 50%;
	aspect-ratio: 1;
	width: 1.6%;
	height: 1.6%;
	/* box-shadow: 0 0 10px rgb(255, 0, 0); */
	background-color: rgb(0, 68, 255);
	border: 2px solid rgb(255, 94, 0);
	z-index: 2;
	transform: translate(-50%, -50%);
	overflow: hidden;
}

button {
	position: absolute;
	width: 100%;
	height: 100%;
	background-color: rgb(255, 0, 0);
	cursor: pointer;
	/* border: 1px rgb(0, 114, 0) solid; */
}
</style>