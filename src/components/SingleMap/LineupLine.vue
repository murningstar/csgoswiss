<script setup lang="ts">
import { ViewLine } from "@/data/types/ViewItems";
import { computed } from "vue";
const props = defineProps<{
    viewLine: ViewLine;
}>();

const throwId = props.viewLine.throwSpot.spotId;
const landId = props.viewLine.landSpot.spotId;

const viewLandSpot = props.viewLine.factory.viewLandSpots.value.get(landId)!;
const viewThrowSpot = props.viewLine.factory.viewThrowSpots.value.get(throwId)!;

const x2 = viewLandSpot.landSpot.coords.x;
const y2 = viewLandSpot.landSpot.coords.y;
const x1 = viewThrowSpot.throwSpot.coords.x;
const y1 = viewThrowSpot.throwSpot.coords.y;

const isSelected = computed(
    () =>
        props.viewLine.state.value == "ONLY_SELECTED_SINGLE" ||
        props.viewLine.state.value == "ONLY_SELECTED_MULTIPLE" ||
        props.viewLine.state.value == "ACTIVE_AND_SELECTED",
);
const hslColor = viewLandSpot.hslColor;
const stroke = computed(() =>
    isSelected.value ? `hsl(${hslColor.value}, 100%, 56%)` : `hsl(${hslColor.value}, 80%, 55%)`,
);
</script>

<template>
    <!-- <div class="svgItemWrapper" v-show="!store.isCmsModeOn"> -->
    <div class="LineupLineWrapper">
        <svg>
            <line
                :x1="`${x1}%`"
                :y1="`${y1}%`"
                :x2="`${x2}%`"
                :y2="`${y2}%`"
                :stroke="stroke"
                :class="{ lineSelected: isSelected }"
            />
        </svg>

        <img
            ref="smokeexecIcon"
            src="@/assets/icons/smokeicon.png"
            alt=""
            class="smokeexecIcon"
            :style="{
                '--spotX': `${x1}%`,
                '--spotY': `${y1}%`,
                '--nadeX': `${x2}%`,
                '--nadeY': `${y2}%`,
                '--duration': `${viewLandSpot.avgDuration.value}s`,
                '--rotate-from': `${-Math.random() * 72 * 10 - Math.random() * 270}deg`,
                '--rotate-to': `${Math.random() * 72 * 10}deg`,
                filter: `hue-rotate(${Number(hslColor) + 360 - 40}deg) sepia(33%)`,
            }"
        />
    </div>
</template>

<style scoped lang="scss">
svg {
    position: absolute;
    // z-index: 1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    // background-color: rgba(0, 224, 90, 0.1);
    pointer-events: none;
}

line {
    stroke-miterlimit: $border_dark;
    // stroke: hsl(52, 88%, 56%);
    stroke-width: 1;
    stroke-linecap: round;
    stroke-dasharray: 1 1.5;
    animation: stroke 60s linear infinite;
    filter: drop-shadow(0px 0px 1px rgba(209, 191, 120, 0.3));
}

.lineSelected {
    stroke-dasharray: none;
}

.smokeexecIcon {
    display: block;
    position: absolute;
    translate: -50% -50%;
    animation: execution var(--duration) linear infinite;
    height: 16px;
    z-index: 2;
    pointer-events: none;

    @keyframes execution {
        0% {
            top: var(--spotY);
            left: var(--spotX);
            scale: 0.777;
            rotate: var(--rotate-from);
        }

        50% {
            scale: 1;
        }

        100% {
            top: var(--nadeY);
            left: var(--nadeX);
            scale: 0.9;
            rotate: var(--rotate-to);
        }
    }
}

@keyframes stroke {
    to {
        stroke-dashoffset: 0;
    }

    from {
        stroke-dashoffset: 100%;
    }
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
