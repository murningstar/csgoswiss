<script lang="ts" setup>
import { onMounted, reactive, ref, type ComputedRef, type Ref, computed } from "vue";
import { useLoadingGoldsourceLogic } from "@/components/Loading_goldsource/loading_goldsource"
import GS_Window from "@/components/UI/GS_Window.vue"
const { isLoading, nSegmentsVisible, startLoading, endLoading } = useLoadingGoldsourceLogic()
startLoading();
onMounted(() => {
	endLoading()
});
const isNotificationVisible = ref(true)
const hideNotification = () => isNotificationVisible.value = false
</script>

<template>
	<div class="layout-gridContainer">
		<div class="mapNav">
			<Navbar />
			<Maps />
			<!-- <Navbar style="grid-area: nav;"/> -->
			<!-- <Maps style="grid-area: maps;"/>  -->
			<Teleport to="body">
				<Loading_goldsource v-if="isLoading"
					:nSegmentsVisible="nSegmentsVisible">
					<template #title>
						Loading...
					</template>
					<template #message>
						Initializing...
					</template>
				</Loading_goldsource>
			</Teleport>
		</div>
	</div>
	<Teleport to="body" v-if="isNotificationVisible">
		<div class="bgdarker">
			<GS_Window @exit="hideNotification">
				<template #title>Source 2 waiting room</template>
				Development is stopped until Source 2 is released to see if it's
				even
				relevant.
			</GS_Window>
		</div>
	</Teleport>
	<!-- <div>someCOntent</div> -->
	<!-- <div>{{ computedDoubler }}</div> -->
	<!-- <div style="background-color: black;" @click="increment">asd</div> -->
</template>

<style lang="scss">
$border_light: rgb(135, 147, 127);
$bg_light: rgb(75, 87, 67);
$bg_dark: rgba(53, 61, 46, 1);
$border_dark: rgb(35, 41, 27);

.layout-gridContainer {
	border: 1px solid rgb(102, 0, 255);
	height: 100vh;

	// background-color: $bg_light;
	// display: grid;
	// grid-template-areas:
	// "nav"
	// "maps";
	// grid-template-columns: 1fr;
	// grid-template-rows: auto minmax(0, 1fr);
	// max-height: 100vh;
	.mapNav {
		min-height: 100%;
		max-height: 100vh;
		width: 100%;
		// border: 5px dashed rgb(248, 13, 13);
		display: flex;
		flex-direction: column;
		background-color: var(--bg_light);
	}
}

.bgdarker {
	position: absolute;
	inset: 0;
	background-color: rgba(0, 0, 0, 0.76);
}
</style>
