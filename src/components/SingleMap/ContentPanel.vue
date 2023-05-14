<script setup lang="ts">
import type { LineupItem, ViewFromSpot, ViewToSpot } from '@/data/types/ViewItems';
import GS_Window from '@/components/UI/GS_Window.vue';
import GS_ContainerLight from '@/components/UI/GS_ContainerLight.vue';
const props = defineProps<{
    isVisible: boolean,
    lineup: LineupItem | undefined,
    toSpot: ViewToSpot | undefined,
    fromSpot: ViewFromSpot | undefined
}>()
function onScroll(e: Event) {

    if ((e.target as HTMLDivElement).className == 'contentPanel') {
        console.log(123);
    }
}
</script>

<template>
    <Teleport to="body">
        <div class="contentPanel" v-if="isVisible"
            :style="{ '--hsl': toSpot?.hslColor }" @scroll="onScroll">
            <div class="screenPanel">
                <img class="screenPanel__img" :src="fromSpot?.fromSpot.fromImgSrc!"
                    alt="">
                <div class="screenPanel__label">Stand there</div>
            </div>
            <div class="screenPanel">
                <img class="screenPanel__img" :src="toSpot?.toSpot.toImgSrc!"
                    alt="">
                <div class="screenPanel__label">Aim there</div>
            </div>
            <div class="screenPanel">
                <img class="screenPanel__img" :src="lineup?.lineup.imgSrcAim!"
                    alt="">
                <div class="screenPanel__label">s</div>
            </div>
            <div class="screenPanel">
                <img class="screenPanel__img" :src="lineup?.lineup.imgSrcAimZoom!"
                    alt="">
                <div class="screenPanel__label">s</div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped lang="scss">
.contentPanel {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.57);
    z-index: 20;
    display: grid;
    gap: 2rem;
    grid-template-columns: 1rem 1fr 1fr 1rem;
    grid-template-rows: 1fr 1fr;
}

.screenPanel {
    @include gs-bd;
    background-color: hsla(var(--hsl), 75%, 57%, 0.634);

    &__img {
        display: block;
        height: 100%;
        width: 100%;
        object-fit: cover;
    }

    &__label {
        border-top: 1px $border_dark solid;
        // color: hsl(var(--hsl), 100%, 70%);
        color: white;
        text-align: center;
        background-color: rgb(43, 43, 43);
    }
}
</style>