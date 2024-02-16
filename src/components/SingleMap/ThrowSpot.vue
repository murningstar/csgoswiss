<script setup lang="ts">
import { ViewThrowSpot } from "@/data/types/ViewItems";
import { useSomestore } from "@/stores/somestore";
import { storeToRefs } from "pinia";
import { computed } from "vue";
const props = defineProps<{
    viewThrowSpot: ViewThrowSpot;
}>();
const isSelected = computed(
    () =>
        props.viewThrowSpot.state.value == "ONLY_SELECTED_SINGLE" ||
        props.viewThrowSpot.state.value == "ONLY_SELECTED_MULTIPLE" ||
        props.viewThrowSpot.state.value == "ACTIVE_AND_SELECTED",
);
function handleClick() {
    props.viewThrowSpot.$send("selfClicked", props.viewThrowSpot.throwSpot.spotId);
    props.viewThrowSpot.$sendToDependencies("selfClicked", props.viewThrowSpot.throwSpot.spotId);
}
const { isDebugModeOn } = storeToRefs(useSomestore());

enum ThrowSpotState {
    Active,
    Selected
}

</script>

<template>
    <div
        class="throwSpotContainer"
        :style="{
            top: `${viewThrowSpot.throwSpot.coords.y}%`,
            left: `${viewThrowSpot.throwSpot.coords.x}%`,
        }"
        @click.stop="handleClick()"
    >
        <button class="throwSpot"></button>
        <svg>
            <circle
                class="outerCircle"
                cx="50%"
                cy="50%"
                r="48%"
                :style="{ strokeDasharray: isSelected ? 'none' : '1 2' }"
            />
        </svg>
        <section class="debug" v-if="isDebugModeOn">
            {{ props.viewThrowSpot.state.value }}
        </section>
    </div>
</template>

<style scoped lang="scss">
.throwSpotContainer {
    position: absolute;
    translate: -50% -50%;
    box-sizing: content-box;
    width: 0.83%;
    height: 0.83%;
    // z-index: 4;
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
    z-index: 10;
    cursor: pointer;
}

svg {
    width: 420%;
    height: 420%;
    position: absolute;
    top: 50%;
    left: 50%;
    translate: -50% -50%;
    // z-index: 0;
    animation: rotate 10s linear infinite;
    // background-color: red;
    border-radius: 50%;
    cursor: pointer;
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
.debug {
    position: absolute;
    background-color: blue;
    font-size: 8px;
    line-height: 1;
    height: 10px;
    transform: translate(-45%, 15px);
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
