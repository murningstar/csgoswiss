
<script setup lang="ts">
defineProps(['smoke'])
</script>

<template>
	<div class="smokeContainer" :style="{
		top: `${smoke.coords.y}%`,
		left: `${smoke.coords.x}%`,
	}">
		<button></button>
		<img class="sprite" src="@/assets/ui/smoke_sprite2.webp"
			alt="Smoke effect image downloading error" />
	</div>
</template>

<style scoped>
.smokeContainer {
	position: absolute;
	width: fit-content;
	height: fit-content;
	/* border-radius: 50%; */
	/* aspect-ratio: 1; */
	/* box-shadow: 0 0 10px rgb(255, 0, 0); */
	/* background-color: rgb(0, 68, 255); */
	/* border: 2px solid rgb(0, 68, 255); */
	z-index: 2;
	transform: translate(-50%, -50%);
}

button {
	position: absolute;
	width: 88%;
	height: 88%;
	border-radius: 50%;
	/* background-color: rgba(128, 128, 128, 0); */
	opacity: 0;
	cursor: pointer;
	top: 50%;
	left: 50%;
	translate: -50% -50%;
	/* border: 1px rgb(0, 114, 0) solid; */
}

.sprite {
	width: 35px;
	height: 35px;
	position: relative;
	display: block;
	/* border: 1px red solid; */
	z-index: -1;
	opacity: 66%;
	/* border: 2px red solid; */
	animation: rotateSprite 20s linear infinite;
	animation: rotateSprite 20s linear infinite,
		scaleSprite 5s ease-in-out infinite;
	pointer-events: none;
}

button:hover + .sprite {
	opacity: 93%;
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