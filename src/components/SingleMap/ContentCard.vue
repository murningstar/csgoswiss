<script setup lang="ts">
import type { LineupItem, ViewFromSpot, ViewToSpot } from '@/data/types/ViewItems';
import type { Lineup } from '@/data/v2_spotSvyaz/Lineup';
import { computed } from 'vue';

const props = defineProps<{
    toSpot: ViewToSpot,
    lineup: Lineup,
    fromSpot: ViewFromSpot,
    isMinimized: boolean
}>()
const iconSrc = computed(() => {
    return `/src/assets/icons/icon_${props.lineup.nadeType}.webp`
})

</script>

<template>
    <article class="contentItem" :style="{ '--hsl': toSpot.hslColor }">
        <header class="contentItem__header">
            <span class="capitalizer hsl">{{ toSpot.toSpot.name }}</span>
            {{ lineup.nadeType }}
            <img :src="iconSrc" alt="SmokeImg" style="max-height: 15px;">
            from
            {{ fromSpot.fromSpot.name }}
        </header>
        <section class="contentItem__content" v-if="!isMinimized">
            <figure class="figure">
                <div class="figure__imgCont">
                    <img class="figure__img"
                        :src="fromSpot.fromSpot.fromImgSrc!"
                        alt="">
                </div>
                <figcaption class="figure__caption">
                    Stand there
                </figcaption>
            </figure>
            <figure class="figure">
                <div class="figure__imgCont">
                    <img class="figure__img"
                        :src="lineup.imgSrcAim!" alt="">
                </div>
                <figcaption class="figure__caption">
                    Aim there
                </figcaption>
            </figure>
            <figure class="figure">
                <div class="figure__imgCont">
                    <img class="figure__img"
                        :src="toSpot.toSpot.toImgSrc!" alt="">
                </div>
                <figcaption class="figure__caption">
                    Lands<span class="hsl"> there</span>
                </figcaption>
            </figure>
        </section>

        <!-- <section class="contentItem__content" v-if="!isMinimized">
            <figure class="figure">
                <div class="figure__imgCont">
                    <img class="figure__img"
                        src="@/assets/content/spots/mirage/tSpawnTrashcan/tSpawnTrashcan.jpg" alt="">
                </div>
                <figcaption class="figure__caption">
                    Stand there
                </figcaption>
            </figure>
            <figure class="figure">
                <div class="figure__imgCont">
                    <img class="figure__img"
                        src="@/assets/content/mirage/windowLineup1.jpg" alt="">
            </div>
            <figcaption class="figure__caption">
                    Aim there
                </figcaption>
            </figure>
            <figure class="figure">
                <div class="figure__imgCont">
                    <img class="figure__img"
                        src="@/assets/content/mirage/window.jpg" alt="">
                </div>
                <figcaption class="figure__caption">
                    Lands<span class="hsl"> there</span>
                </figcaption>
            </figure>
        </section> -->
        <!-- <footer class="contentItem__tags"></footer> -->
    </article>
</template>

<style scoped lang="scss">
.contentItem {
    padding: 0.5rem;
    background-color: hsla(var(--hsl), 50%, 35%, 0.5);
    @include gs-bd;
    cursor: pointer;

    &__header {}

    &__content {
        display: flex;
    }
}

.figure {
    &__imgCont {
        overflow: hidden;
        width: 300px;
        height: 300px;
    }

    &__img {
        width: 100%;
        height: 100%;
        object-fit: cover;

        &:hover {
            scale: 1.3;
        }
    }

    &__caption {
        text-align: center;
    }
}

.capitalizer {
    text-transform: capitalize;
}

.hsl {
    color: hsl(var(--hsl), 100%, 60%);
}
</style>