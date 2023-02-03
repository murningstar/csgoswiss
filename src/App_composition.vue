<template>
	<div class="layout-gridContainer">
		<div class="mapNav">
			<loading-window
				v-if="isLoading"
				@imgLoaded="isLoading = false"
				:nSegmentsVisible="nSegmentsVisible"
			/>
			<maps-nav @emit-startLoading="isLoading = true" />
			<maps @mapLoaded="hideLoading" />
			<!-- <maps-nav style="grid-area: nav;"/>
			<maps style="grid-area: maps;"/> -->
		</div>
	</div>
</template>

<script>
export default {
	data: () => {
		return {
			isLoading: false,
			nSegmentsVisible: 0,
		};
	},
	methods: {
		startLoading() {
			// new Promise((res, rej) => {});
			for (let i = 0; i < 15; i++) {
				setTimeout(() => {
					console.log(i);
					this.nSegmentsVisible += 1;
				}, i * 10);
			}
		},
		// works only on Maps.vue's emits
		hideLoading() {
			setTimeout(() => {
				this.isLoading = false;
			}, 700);
		},
	},
	created() {
		this.isLoading = true;
		this.startLoading();
	},
};
</script>

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
