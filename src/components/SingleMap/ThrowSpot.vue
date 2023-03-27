<script setup lang="ts">
import type { ThrowSpot } from '@/data/interfaces/ThrowSpot';

const props = defineProps<{
    throwSpot: ThrowSpot
}>()

function onclick() {
    console.log(123);
}
</script>

<template>
    <div class="spotContainer" :style="{
        top: `${throwSpot.coords.y}%`,
        left: `${throwSpot.coords.x}%`
    }" @click="onclick">
        <button class="throwSpot">
        </button>
        <svg>
            <circle class="outerCircle" cx='50%' cy='50%' r="48%" />
        </svg>
    </div>
</template>

<style scoped lang="scss">
.spotContainer {
    position: absolute;
    translate: -50% -50%;
    box-sizing: content-box;
    width: 5px;
    height: 5px;
}

.throwSpot {
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 50%;
    left: 50%;
    translate: -50% -50%;
    // background-color: #e1e5e9;
    // border: 1px dashed #3f3f3f;
    background-color: rgb(226, 190, 30);
    border: 1px solid #ffffff;
    border-radius: 50%;
    z-index: 1;
    cursor: pointer;
}

svg {
    cursor: pointer;
    width: 800%;
    height: 800%;
    position: absolute;
    top: 50%;
    left: 50%;
    translate: -50% -50%;
    z-index: 0;
    animation: rotate 10s linear infinite;
    // background-color: red;
    border-radius: 50%;
}

.outerCircle {
    fill: #3f3f3f60;
    stroke: white;
    stroke-width: 1;
    stroke-dasharray: 1 2;
    stroke-linecap: round;

    /* Прикольный стиль, тока неуместный */
    // fill: #3f3f3fb7;
    // stroke: white;
    // stroke-width: 1.3;
    // stroke-dasharray: 2.5 2.1;
    // stroke-linecap: round;

}

@keyframes rotate {
    from {
        rotate: 0deg;
    }

    to {
        rotate: 360deg;
    }
}
</style>