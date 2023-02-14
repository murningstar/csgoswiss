<script lang="ts" setup>
import { ref, onBeforeMount } from "vue";
const isLoading = ref(false);
const nSegmentsVisible = ref(0);
onBeforeMount(() => {
	startLoading();
});
function startLoading() {
	isLoading.value = true;
	nSegmentsVisible.value = 0;
	for (let i = 0; i < 15; i++) {
		setTimeout(() => {
			console.log(`progressbar element № ${i}`);
			nSegmentsVisible.value += 1;
		}, i * 10);
	}
}
async function hideLoading() {
	/* hideLoading используется только на эмитах из Maps.vue
	hideLoading срабатывает когда изображение карты уже загружено. В этот момент progressbar
	должен находиться в состоянии загрузки 15/21(аутентичность goldsource UI). */
	await new Promise((res) => {
		/* Первый таймаут нужен для ситуации, когда эмит из Maps может произойти мгновенно.
		То есть, чтобы отрисовка последних палок не прокнула во время отрисовки 15 первых. 
		(для аутентичности загрузки goldsource) */
		setTimeout(() => {
			res("");
		}, 100);
	});
	await new Promise((res) => {
		/* Здесь цикл спавнит таймауты со временем i*10 (то есть 10, 20, 30... мс),
		для дорисовки оставшихся палок в progressbar */
		for (let i = 0; i < 6; i++) {
			setTimeout(() => {
				nSegmentsVisible.value += 1;
				if (i >= 5) {
					res("");
				}
			}, i * 10);
		}
	});
	setTimeout(() => {
		/* Выключение окна загрузки.
		Обёрнуто в таймаут тоже с декоративной целью */
		isLoading.value = false;
		nSegmentsVisible.value = 0;
	}, 40);
}
</script>

<template>
	<div class="layout-gridContainer">
		<div class="mapNav">
			<Navbar @emit-startLoading="startLoading()" />
			<Maps @mapLoaded="hideLoading" />
			<!-- <Navbar style="grid-area: nav;"/> -->
			<!-- <Maps style="grid-area: maps;"/>  -->
			<Teleport to="body">
				<Loading_goldsource v-if="isLoading" @imgLoaded="isLoading = false" :nSegmentsVisible="nSegmentsVisible">
					<template #title>
						Loading...
					</template>
					<template #message>
						Downloading first map image...
					</template>
				</Loading_goldsource>
			</Teleport>
		</div>
	</div>
</template>

<style lang="scss">
$border_light: rgb(135, 147, 127);
$bg_light: rgb(75, 87, 67);
$bg_dark: rgba(53, 61, 46, 1);
$border_dark: rgb(35, 41, 27);

.layout-gridContainer {
	border: 5px solid green;

	// background-color: $bg_light;
	// display: grid;
	// grid-template-areas:
	// "nav"
	// "maps";
	// grid-template-columns: 1fr;
	// grid-template-rows: auto minmax(0, 1fr);
	// max-height: 100vh;
	.mapNav {
		max-height: 100vh;
		border: 5px solid rgb(101, 22, 63);
		display: flex;
		flex-direction: column;
		background-color: var(--bg_light);
	}
}
</style>
