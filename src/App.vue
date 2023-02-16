<script lang="ts" setup>
import { onMounted } from "vue";
import { useLoadingGoldsourceLogic } from "@/composables/loading_goldsource"
const { isLoading, nSegmentsVisible, startLoading, endLoading } = useLoadingGoldsourceLogic()
startLoading();
onMounted(() => {
	endLoading()
});

</script>

<template>
	<div class="layout-gridContainer">
		<div class="mapNav">
			<Navbar />
			<Maps />
			<!-- <Navbar style="grid-area: nav;"/> -->
			<!-- <Maps style="grid-area: maps;"/>  -->
			<Teleport to="body">
				<Loading_goldsource v-if="isLoading" :nSegmentsVisible="nSegmentsVisible">
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
