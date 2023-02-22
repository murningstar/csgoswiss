<script setup lang="ts">
defineProps(['flash'])
</script>

<template>
    <div class="flashContainer" :style="{
        top: `${flash.coords.y}%`,
        left: `${flash.coords.x}%`,
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