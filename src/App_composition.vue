<template>
	<div class="layout-gridContainer">
		<div class="mapNav">
			<Loading_goldsource
				v-if="isLoading"
				@imgLoaded="isLoading = false"
				:nSegmentsVisible="nSegmentsVisible"
			/>
			<Navbar @emit-startLoading="startLoading()" />
			<Maps @mapLoaded="hideLoading" />
			<!-- <Navbar style="grid-area: nav;"/> -->
			<!-- <Maps style="grid-area: maps;"/>  -->
		</div>
	</div>
</template>

<script lang="ts">
export default {
	data: () => {
		return {
			isLoading: false,
			nSegmentsVisible: 0,
		};
	},
	methods: {
		startLoading() {
			this.isLoading = true;
			this.nSegmentsVisible = 0;
			for (let i = 0; i < 15; i++) {
				setTimeout(() => {
					console.log(i);
					this.nSegmentsVisible += 1;
				}, i * 10);
			}
		},
		// Используется только на эмитах из Maps.vue
		async hideLoading() {
			await new Promise((res) => {
				setTimeout(() => {
					res("");
				}, 100);
			});
			await new Promise((res) => {
				for (let i = 0; i < 6; i++) {
					setTimeout(() => {
						this.nSegmentsVisible += 1;
						if (i >= 5) {
							res("");
						}
					}, i * 10);
				}
			});
			setTimeout(() => {
				this.isLoading = false;
				this.nSegmentsVisible = 0;
			}, 40);
		},
	},
	created() {
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
