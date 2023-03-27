
<script setup lang="ts">
import type { Grenade } from '@/data/interfaces/Grenade';
import { reactive, computed, ref, onMounted } from 'vue';
const props = defineProps<{
    grenade: Grenade,
    nadeType: string,
    side: string,
    tickrate: number,
    difficultiesState: {
        easyVisible: boolean,
        normalVisible: boolean,
        mediumVisible: boolean,
        hardVisible: boolean,
        pixelPerfectVisible: boolean,
    },
    onewayOption: string,
    fakeOption: string,
    bugOption: string,
    pointSize: number,

    isSelected: boolean,
}>()
const grenade = reactive(props.grenade)
const showIf = computed(() => {
    return (props.nadeType === 'All' || props.nadeType === 'Smoke') &&
        props.side === grenade.side &&
        props.tickrate === grenade.tickrate &&
        props.difficultiesState[`${grenade.difficulty}Visible` as keyof typeof props.difficultiesState] &&
        (
            grenade.isOnewaySmoke === true && (
                props.onewayOption === 'Oneways only' ||
                props.onewayOption === 'All'
            ) ||
            grenade.isOnewaySmoke === false && (
                props.onewayOption === 'Regular only' ||
                props.onewayOption === 'All'
            )
        ) &&
        (
            grenade.isFakeSmoke === true && (
                props.fakeOption === 'FakeSmokes only' ||
                props.fakeOption === 'All'
            ) ||
            grenade.isFakeSmoke === false && (
                props.fakeOption === 'Regular only' ||
                props.fakeOption === 'All'
            )
        ) &&
        (
            grenade.isFakeSmoke === true && (
                props.bugOption === 'BugSmokes only' ||
                props.bugOption === 'All'
            ) ||
            grenade.isFakeSmoke === false && (
                props.bugOption === 'Regular only' ||
                props.bugOption === 'All'
            )
        )
})
const spriteRef = ref(null)
defineExpose({
    spriteRef
})
onMounted(() => {
    console.log('smoke mounte');
    // spriteRef.value!.style.animationPlayState = "running"
})
</script>

<template>
    <div class="smokeContainer" :style="{
        top: `${grenade.coords.y}%`,
        left: `${grenade.coords.x}%`,
        width: `${pointSize}px`,
        height: `${pointSize}px`,
    }" v-show="showIf || isSelected">
        <button class="button" :class="{ clicked: isSelected }"></button>
        <img class="sprite" src="@/assets/ui/smoke_sprite2.webp"
            alt="Smoke effect image downloading error" ref="spriteRef" />
    </div>
</template>

<style scoped lang="scss">
.smokeContainer {
    position: absolute;
    z-index: 3;
    width: 10px;
    /* Потом нужно будет поменять на вычислинные в js значения */
    height: 10px;
    /* в зависимости от текущего размера картинки  */
    /* border: 15px solid rgb(255, 0, 0); */
    box-sizing: content-box;
    translate: -50% -50%;
}

.button {
    position: absolute;
    z-index: 10;
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
}

.button::before {
    content: '';
    display: inline-block;
    position: absolute;
    z-index: -1;
    /* border-radius: 50%; */
    top: 50%;
    left: 50%;
    width: 450%;
    height: 450%;
    /* background: radial-gradient(circle, rgba(237, 237, 237, 1) 0%, rgba(237, 237, 237, 1) 14%, rgba(255, 237, 237, 0.5) 56%, rgba(237, 237, 237, 0) 70.71%); */
    background: radial-gradient(circle, rgba(237, 237, 237, 1) 0%, rgb(174, 174, 174) 0%, rgba(237, 237, 237, 1) 33%, rgba(237, 237, 237, 0.5) 57%, rgba(237, 237, 237, 0) 71%);
    translate: -50% -50%;
    transform: translateZ(-1px);
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
    z-index: -1;
    opacity: 16%;
    /* opacity: 100%; */
    width: 400%;
    height: 400%;
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
    border: 1px dashed #3f3f3f;
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