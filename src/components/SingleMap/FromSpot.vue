<script setup lang="ts">
import { computed } from 'vue';
import type { Difficulty, ForWhom, NadeType, Side, Tickrate } from '@/data/types/GrenadeProperties';
import type { Lineup } from '@/data/interfaces/Lineup';
import type { Spot } from '@/data/interfaces/Spot';
import type { ViewFromSpot } from '@/data/types/ViewItems';
const props = defineProps<{
    fromItem: ViewFromSpot,
    filter: {
        nadeType: "all" | "smoke" | "molotov" | "flash" | "he",
        side: Side,
        tickrate: Tickrate,
        difficulties: Set<Difficulty>,
        onewaySmokeOption: string,
        fakeSmokeOption: string,
        bugSmokeOption: string,
        forWhom: ForWhom,
        onewayMolotovOption: string,
        fakeMolotovOption: string,
        bugMolotovOption: string,
        bugHeOption: string,
    },
}>()
const emit = defineEmits(['myclick'])

const difficultyIntersection = computed(() => {
    const filterDifficulties: Difficulty[] = []
    props.filter.difficulties.forEach((dif) => {
        filterDifficulties.push(dif)
    })
    const res = filterDifficulties.some((dif) => {
        return props.fromItem.filter.difficulties[dif] > 0
    })
    return res
})

const showIf = computed(() => {
    return (
        (props.fromItem.filter.nadeType[props.filter.nadeType] > 0
            || props.filter.nadeType === 'all') &&
        props.fromItem.filter.side[props.filter.side] > 0 &&
        props.fromItem.filter.tickrate[props.filter.tickrate] > 0 &&
        difficultyIntersection.value
    )
})
</script>

<template>
    <div class="spotContainer" :style="{
        top: `${fromItem.fromSpot.coords.y}%`,
        left: `${fromItem.fromSpot.coords.x}%`
    }" @click.stop="emit('myclick',)" v-show="showIf">
        <button class="throwSpot">
        </button>
        <svg>
            <circle class="outerCircle" cx='50%' cy='50%' r="48%" :style="{
                strokeDasharray: props.fromItem.isSelected ? 'none' : '1 2'
            }" />
        </svg>
    </div>
</template>

<style scoped lang="scss">
.spotContainer {
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

@keyframes rotate {
    from {
        rotate: 0deg;
    }

    to {
        rotate: 360deg;
    }
}
</style>