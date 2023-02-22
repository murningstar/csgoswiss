
<script setup lang="ts">
defineProps(['smoke'])
</script>

<template>
    <div class="smokeContainer" :style="{
        top: `${smoke.coords.y}%`,
        left: `${smoke.coords.x}%`,
    }">
        <button></button>
        <img class="sprite" src="@/assets/smoke_sprite.webp" alt="Smoke effect image downloading error" />
    </div>
</template>

<style scoped>
.smokeContainer {
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

.sprite {
	width: 50px;
	height: 50px;
	position: absolute;
	/* border: 1px red solid; */
	z-index: -1;
	opacity: 50%;
	/* border: 2px red solid; */
	transform: translate(-44%, -43%);
	/* animation: rotateSprite 16s linear infinite; */
	animation: rotateSprite 16s linear infinite,
		scaleSprite 5s ease-in-out infinite;
	transform-origin: 6% 7%;
	pointer-events: none;
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