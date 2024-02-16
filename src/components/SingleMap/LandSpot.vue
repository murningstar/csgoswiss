<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import type { ViewLandSpot } from "@/data/types/ViewItems";
import { storeToRefs } from "pinia";
import { useSomestore } from "@/stores/somestore";

const { isDebugModeOn } = storeToRefs(useSomestore());

const props = defineProps<{ viewLandSpot: ViewLandSpot }>();

/* landSpot !!! */
const viewLandSpot = reactive(props.viewLandSpot);

/* Эта хрень экспозится т.к. GSAP (для вращения смока) применяется в родительском компоненте */
const spriteRef = ref(null);
defineExpose({
    spriteRef,
});
onMounted(() => {
    // spriteRef.value!.style.animationPlayState = "running"
});
console.log(props.viewLandSpot);
</script>

<template>
    <div
        class="grenadeContainer"
        :style="{
            top: `${viewLandSpot.landSpot.coords.y}%`,
            left: `${viewLandSpot.landSpot.coords.x}%`,
        }"
    >
        <button
            class="button"
            :class="{
                // clicked: isActive,
                // selected: isSelected
            }"
        ></button>
        <img
            class="sprite"
            src="@/assets/ui/Smoke_circle.png"
            alt="Smoke effect image downloading error"
            ref="spriteRef"
        />
        <section class="debug" v-if="isDebugModeOn">
            {{ props.viewLandSpot.state.value }}
        </section>
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
    content: "";
    display: inline-block;
    position: absolute;
    // z-index: -1;
    /* border-radius: 50%; */
    top: 50%;
    left: 50%;
    width: 450%;
    height: 450%;
    // background: radial-gradient(circle, rgba(237, 237, 237, 1) 0%, rgba(237, 237, 237, 1) 14%, rgba(255, 237, 237, 0.5) 56%, rgba(237, 237, 237, 0) 70.71%);
    background: radial-gradient(
        circle,
        rgba(237, 237, 237, 1) 0%,
        rgb(174, 174, 174) 0%,
        rgba(237, 237, 237, 1) 33%,
        rgba(237, 237, 237, 0.5) 57%,
        rgba(237, 237, 237, 0) 71%
    );
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
    background: radial-gradient(
        circle,
        rgba(237, 237, 237, 1) 0%,
        rgba(237, 237, 237, 1) 14%,
        rgba(237, 237, 237, 0.95) 55%,
        rgba(237, 237, 237, 0.6) 62%,
        rgba(237, 237, 237, 0) 70.71%
    );
}

.sprite:hover ~ .button {
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
    background: radial-gradient(
        circle,
        rgba(237, 237, 237, 1) 0%,
        rgba(237, 237, 237, 1) 14%,
        rgba(237, 237, 237, 0.95) 55%,
        rgba(237, 237, 237, 0.6) 62%,
        rgba(237, 237, 237, 0) 70.71%
    );
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
    background: radial-gradient(
        circle,
        rgba(237, 237, 237, 1) 0%,
        rgba(237, 237, 237, 1) 14%,
        rgba(237, 237, 237, 0.95) 55%,
        rgba(237, 237, 237, 0.6) 62%,
        rgba(237, 237, 237, 0) 70.71%
    );
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

.debug {
    position: absolute;
    background-color: rgb(89, 119, 28);
    font-size: 4px;
    line-height: 1;
    height: 5px;
    transform: translate(-45%, 15px);
}
</style>
