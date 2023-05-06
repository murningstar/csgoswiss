
<script setup lang="ts">
import type { Grenade } from '@/data/_old/Grenade';
import type { Difficulty, ForWhom, NadeType, Side, Tickrate, ViewCountDifficulty, ViewCountNadeType, ViewCountSide, ViewCountTickrate } from '@/data/types/GrenadeProperties';
import type { Spot } from '@/data/interfaces/Spot';
import { reactive, computed, ref, onMounted } from 'vue';
const props = defineProps<{
    toItem: {
        toSpot: Spot;
        filter: {
            nadeType: ViewCountNadeType;
            side: ViewCountSide;
            tickrate: ViewCountTickrate;
            difficulties: ViewCountDifficulty;
        };
        lineupIds: string[];
    },
    pointSize: number,
    isActive: boolean,
    isSelected: boolean,
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

/* toSpot !!! */
const toSpot = reactive(props.toItem)

const difficultyIntersection = computed(() => {
    const filterDifficulties: Difficulty[] = []
    props.filter.difficulties.forEach((dif) => {
        filterDifficulties.push(dif)
    })
    const res = filterDifficulties.some((difficulty) => {
        return toSpot.filter.difficulties[difficulty] > 0
    })
    return res
})

const showIf = computed(() => {
    console.log('difficultyIntersection ', difficultyIntersection.value);
    return (
        (toSpot.filter.nadeType[props.filter.nadeType] > 0 //может произойти сравнение undefined > 0 (так и надо, undefined > 0 все равно вернет false. и следующее выражение вернет true, если значение фильтра - "all")
            || props.filter.nadeType == 'all')
        && toSpot.filter.side[props.filter.side] > 0
        && toSpot.filter.tickrate[props.filter.tickrate] > 0
        && difficultyIntersection.value)
    // &&
    // (
    //     toSpot.isOnewaySmoke === true && (
    //         props.onewayOption === 'Oneways only' ||
    //         props.onewayOption === 'All'
    //     ) ||
    //     toSpot.isOnewaySmoke === false && (
    //         props.onewayOption === 'Regular only' ||
    //         props.onewayOption === 'All'
    //     )
    // ) &&
    // (
    //     toSpot.isFakeSmoke === true && (
    //         props.fakeOption === 'FakeSmokes only' ||
    //         props.fakeOption === 'All'
    //     ) ||
    //     toSpot.isFakeSmoke === false && (
    //         props.fakeOption === 'Regular only' ||
    //         props.fakeOption === 'All'
    //     )
    // ) &&
    // (
    //     toSpot.isFakeSmoke === true && (
    //         props.bugOption === 'BugSmokes only' ||
    //         props.bugOption === 'All'
    //     ) ||
    //     toSpot.isFakeSmoke === false && (
    //         props.bugOption === 'Regular only' ||
    //         props.bugOption === 'All'
    //     )
    // )
})
const spriteRef = ref(null)
defineExpose({
    spriteRef
})
onMounted(() => {
    console.log('smoke mounte');
    // spriteRef.value!.style.animationPlayState = "running"
})
console.log(props.toItem);


// v-show="showIf || isActive"
</script>


<template>
    <div class="grenadeContainer" :style="{
        top: `${toSpot.toSpot.coords.y}%`,
        left: `${toSpot.toSpot.coords.x}%`,
        // width: `${pointSize}px`,
        // height: `${pointSize}px`,
    }" v-show="showIf || isActive || isSelected">
        <button class="button" :class="{
            clicked: isActive,
            selected: isSelected
        }"></button>
        <img class="sprite" src="@/assets/ui/Smoke circle.png"
            alt="Smoke effect image downloading error" ref="spriteRef" />
    </div>
</template>

<style scoped lang="scss">
.grenadeContainer {
    position: absolute;
    // z-index: 3;
    width: 10px;
    height: 10px;
    width: 1.54%;
    height: 1.54%;
    /* Потом нужно будет поменять на вычислинные в js значения */
    /* в зависимости от текущего размера картинки  */
    /* border: 15px solid rgb(255, 0, 0); */
    box-sizing: content-box;
    translate: -50% -50%;
    transform-style: preserve-3d;
}

.button {
    position: absolute;
    z-index: 9;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    border-radius: 10px;
    background-color: rgb(43, 45, 46);
    border: rgb(216, 226, 232) 1px solid;
    /* box-shadow: 0 0 5px 2px rgba(0, 0, 0, 0.5); */
    /* border: 1px rgb(0, 114, 0) solid; */
    cursor: pointer;
    transform-style: preserve-3d;
    translate: -50% -50%;
    transform: translateZ(10px);
}

.button::before {
    content: '';
    display: inline-block;
    position: absolute;
    // z-index: -1;
    /* border-radius: 50%; */
    top: 50%;
    left: 50%;
    width: 450%;
    height: 450%;
    // background: radial-gradient(circle, rgba(237, 237, 237, 1) 0%, rgba(237, 237, 237, 1) 14%, rgba(255, 237, 237, 0.5) 56%, rgba(237, 237, 237, 0) 70.71%);
    background: radial-gradient(circle, rgba(237, 237, 237, 1) 0%, rgb(174, 174, 174) 0%, rgba(237, 237, 237, 1) 33%, rgba(237, 237, 237, 0.5) 57%, rgba(237, 237, 237, 0) 71%);
    translate: -50% -50%;
    transform: translateZ(-2px);
    opacity: 100%;
}

.button:hover {
    border: white 1px dashed;
    background-color: rgb(43, 45, 46);
    animation: rotateSprite 5s linear infinite;

    @keyframes rotateSprite {
        from {
            rotate: 0deg;
        }

        to {
            rotate: 360deg;
        }
    }
}

.button:hover::before {
    background: radial-gradient(circle, rgba(237, 237, 237, 1) 0%, rgba(237, 237, 237, 1) 14%, rgba(237, 237, 237, 0.95) 55%, rgba(237, 237, 237, 0.6) 62%, rgba(237, 237, 237, 0) 70.71%);
}

.sprite:hover~.button {
    /* box-shadow: 0 0 5px 2px rgba(0, 0, 0, 0.25), 0 0 4px 16px rgba(237, 237, 237, 1); */
}

.button:active {
    background-color: #767c80;
    // border:
}

.sprite {
    position: absolute;
    display: block;
    top: 50%;
    left: 50%;
    translate: -50% -50%;
    /* border: 1px green solid; */
    // z-index: -1;
    opacity: 16%;
    /* opacity: 100%; */

    width: 400%;
    height: 400%;
    filter: invert(90deg);
    transform: translateZ(-3px);
}

@media (max-width: 550px) {
    .sprite {
        width: 380%;
        height: 380%;
    }
}

@media (max-width: 382px) {
    .button::before {
        width: 520%;
        height: 520%;
    }
}

.clicked {
    background-color: #ead75e;
    border: 1px dashed #ebf3f7;
    animation: rotateSprite 5s linear infinite;
}

.clicked::before {
    background: radial-gradient(circle, rgba(237, 237, 237, 1) 0%, rgba(237, 237, 237, 1) 14%, rgba(237, 237, 237, 0.95) 55%, rgba(237, 237, 237, 0.6) 62%, rgba(237, 237, 237, 0) 70.71%);
}

.clicked:hover {
    background-color: #ead75e;
}

.clicked:active {
    background-color: #ffe14c;
}

.selected {
    background-color: #ead75e;
    border: 1px solid #3f3f3f;
    animation: rotateSprite 5s linear infinite;
}

.selected::before {
    background: radial-gradient(circle, rgba(237, 237, 237, 1) 0%, rgba(237, 237, 237, 1) 14%, rgba(237, 237, 237, 0.95) 55%, rgba(237, 237, 237, 0.6) 62%, rgba(237, 237, 237, 0) 70.71%);
}

.selected:hover {
    background-color: #ead75e;
}

.selected:active {
    background-color: #ffe14c;
}

/* @keyframes scaleSprite {
	0% {
		scale: 0.95;
	}

	50% {
		scale: 1;
	}

	100% {
		scale: 0.95;
	}
} */
</style>