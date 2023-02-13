<template>
	<aside class="loading">
		<p class="loading__title">
			<slot>Loading...</slot>
		</p>
		<p class="loading__message">
			<slot>Downloading map image...</slot>
		</p>
		<div class="loading__progressbar">
			<div class="loading__progressSegment_container" v-for="segment in 21">
				<div class="loading__progressSegment_item" :style="{ visibility: segment <= nSegmentsVisible ? 'visible' : 'hidden', }"></div>
			</div>
		</div>
	</aside>
</template>

<script>
export default {
	name: "Loading_goldsource",
	props: {
		nSegmentsVisible: Number,
	},
};
</script>

<style lang="scss" scoped>
.loading {
	z-index: 10;
	position: absolute;
	width: 550px;
	height: fit-content;
	background-color: purple;
	inset: 0;
	margin: auto;
	display: flex;
	flex-direction: column;
	background-color: var(--bg_light);
	padding-left: 28px;
	padding-top: 12px;
	padding-bottom: 28px;
	border-top: 1px solid var(--border_light);
	border-left: 1px solid var(--border_light);
	border-bottom: 1px solid var(--border_dark);
	border-right: 1px solid var(--border_dark);

	p {
		font-size: 21px;
		font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
		font-weight: 400;
		letter-spacing: -0.8px;
		&.loading__title {
			color: white;
			padding-left: 10px;
			margin-bottom: 12px;
		}
		&.loading__message {
			color: rgb(142, 154, 141);
			margin-bottom: 8px;
		}
	}

	.loading__progressbar {
		display: flex;
		background-color: rgb(62, 70, 55);
		padding: 4px;
		width: fit-content;
		border: 2px solid blue;
		.loading__progressSegment_container {
			border: 2px solid cyan;

			.loading__progressSegment_item {
				border: 2px solid green;
				height: 24px;
				width: 12px;
				margin: 0 3px;
				background-color: rgb(221, 191, 60);
			}
		}
	}
}
</style>
