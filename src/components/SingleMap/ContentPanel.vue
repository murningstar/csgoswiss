<script setup lang="ts">
import { useRoute } from 'vue-router';
import camelcase from "camelcase"
import type { LineupItem, ViewFromSpot, ViewToSpot } from '@/data/types/ViewItems';
import GS_Window from '@/components/UI/GS_Window.vue';
import GS_ContainerLight from '@/components/UI/GS_ContainerLight.vue';
import { computed } from 'vue';
const route = useRoute()
const currentRoute = computed(() => route.path.slice(1))
const props = defineProps<{
    isVisible: boolean,
    lineup: LineupItem,
    toSpot: ViewToSpot,
    fromSpot: ViewFromSpot
}>()
const emit = defineEmits(['exit'])
function onScroll(e: Event) {
    if ((e.target as HTMLDivElement).className == 'contentPanel') {
        console.log(123);
    }
}
const iconSrc = computed(() => `/src/assets/icons/icon_${props.lineup.lineup.nadeType}.webp`)
const fromSrc = computed(() => {
    const priority = props.fromSpot.fromSpot.priority!
    const path = `/src/assets/content/spots/${currentRoute.value}`
    const spotFolderName = camelcase(props.fromSpot.fromSpot.name)
    if (priority == 'fp') return path + "/" + spotFolderName + props.fromSpot.fromSpot.fromSrc_fp
    if (priority == 'tp') return path + "/" + spotFolderName + props.fromSpot.fromSpot.fromSrc_tp
})
const lineupSrc = computed(() => {
    return `/src/assets/content/lineups/${currentRoute.value}/${props.lineup.lineup.name}` + props.lineup.lineup.srcAim
})
const toSrc = computed(() => {
    const path = `/src/assets/content/spots/${currentRoute.value}`
    const spotFolderName = camelcase(props.toSpot.toSpot.name)
    const toSrc = props.toSpot.toSpot.toSrc || props.toSpot.toSpot.toSrc2
    return path + "/" + spotFolderName + toSrc
})
</script>

<template>
    <Teleport to="body">
        <div class="contentPanel" v-if="isVisible"
            :style="{ '--hsl': toSpot?.hslColor }" @scroll="onScroll">
            <header class="contentPanel__header flex">
                <div class="left"></div>
                <div class="tag">
                    <span class="capitalizer hsl">{{ toSpot.toSpot.name }}</span>
                    {{ lineup.lineup.nadeType }}
                    <img :src="iconSrc" alt="smoke grenade icon" class="texticon">
                    from
                    {{ fromSpot.fromSpot.name }}
                </div>
                <button class="right" @click="emit('exit')">
                    X
                </button>
            </header>
            <figure class="screenPanel panelThrow">
                <div class="screenPanel__imgcont">
                    <img class="img" :src="fromSrc" alt="throw spot image">
                </div>
                <figcaption class="screenPanel__label">Stand there</figcaption>
            </figure>
            <figure class="screenPanel panelAim">
                <div class="screenPanel__imgcont">
                    <img class="img" :src="lineupSrc" alt="image of where to aim">
                    <div class="tags">
                        <div class="tag">
                            {{ lineup.lineup.throwClick }}
                        </div>
                        <div class="tag">
                            movement - regular
                        </div>
                    </div>
                </div>
                <figcaption class="screenPanel__label">Aim there</figcaption>
            </figure>
            <figure class="screenPanel panelLand">
                <div class="screenPanel__imgcont">
                    <img class="img" :src="toSrc"
                        alt="image of landing spot">
                </div>
                <figcaption class="screenPanel__label">Lands there</figcaption>
            </figure>
            <figure class="screenPanel panelVideo">
                <div class="iframe-container">
                    <iframe id="ytplayer" type="text/html" width="720" height="405"
                        src="https://www.youtube.com/embed/-3LuxvRzuyU?playlist=-3LuxvRzuyU&loop=1&vq=hd720"
                        frameborder="0" allowfullscreen></iframe>
                </div>
                <figcaption class="screenPanel__label">Video / Animation
                </figcaption>
            </figure>
        </div>
    </Teleport>
</template>

<style scoped lang="scss">
.contentPanel {
    position: fixed;
    // backdrop-filter: blur(2px) contrast(80%);
    inset: 0;
    // border: 5px solid red;
    background-color: rgba(18, 18, 18, 0.8);
    z-index: 20;
    display: grid;
    grid-template:
        ". header header ." 3rem
        ". panel1 panel2 ." minmax(0, 1fr) ". panel3 panel4 ." minmax(0, 1fr) ". . . ." 1rem / 3rem 1fr 1fr 3rem;
    gap: 0.5rem;


    &__header {
        grid-area: header;
        margin-top: 0.5rem;
        display: flex;
        justify-content: space-between;

        .middle {}

        .right {
            aspect-ratio: 1;
            @include gs-bd;
            background-color: $bg_light;
            color: white;
            font-size: 1.3rem;

            &:active {
                @include gs-bd-clicked;
                padding-top: 2px;
                padding-left: 2px;
            }
        }
    }
}

.screenPanel {
    @include gs-bd;
    background-color: hsla(var(--hsl), 75%, 57%, 0.634);
    display: flex;
    flex-direction: column;
    // border: 5px solid green;
    width: 100%;
    overflow: hidden;

    &__imgcont {
        flex-grow: 1;
        overflow: hidden;
        // border: 5px solid red;
        position: relative;

    }

    &__label {
        border-top: 1px $border_dark solid;
        // color: hsl(var(--hsl), 100%, 70%);
        color: white;
        text-align: center;
        background-color: $bg_light;
        margin-top: auto;
    }

    &.panelThrow {
        grid-area: panel1;
    }

    &.panelAim {
        grid-area: panel2;

        & .img {
            transition: all 0.15s cubic-bezier(0.165, 0.84, 0.44, 1);

            &:hover {
                transform: scale(3);
            }
        }
    }

    &.panelLand {
        grid-area: panel3
    }

    &.panelVideo {
        grid-area: panel4
    }
}

.texticon {
    max-height: 1.4rem;
}

.img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    // border: 5px solid red;
}

.iframe-container {
    position: relative;
    width: 100%;
    height: 100%;
}

.iframe-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.capitalizer {
    text-transform: capitalize;
}

.hsl {
    color: hsl(var(--hsl), 100%, 60%);
}

.tags {
    display: flex;
    position: absolute;
    bottom: 0.3rem;
    width: 100%;
    color: rgb(255, 213, 0);
    justify-content: space-evenly;
}
.tag{
    background-color: $bg_light;
    text-align: center;
    box-shadow: 0 0 10px -5px black;
    padding: 0.5rem 0.7rem;
    font-size: 1.6rem;
}
</style>