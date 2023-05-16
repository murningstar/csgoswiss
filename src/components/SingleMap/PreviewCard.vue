<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import camelcase from "camelcase"
import type { LineupItem, ViewFromSpot, ViewToSpot } from '@/data/types/ViewItems';
import type { Lineup } from '@/data/interfaces/Lineup';
const emit = defineEmits(['lineupClicked'])
const props = defineProps<{
    toSpot: ViewToSpot,
    lineup: Lineup,
    fromSpot: ViewFromSpot,
    isMinimized: boolean
}>()
const route = useRoute()
const currentRoute = computed(() => route.path.slice(1))
const fromSrc = computed(() => {
    const priority = props.fromSpot.fromSpot.priority!
    const path = `/src/assets/content/spots/${currentRoute.value}`
    const spotFolderName = camelcase(props.fromSpot.fromSpot.name)
    if (priority == 'fp') return path + "/" + spotFolderName + props.fromSpot.fromSpot.fromSrc_fp
    if (priority == 'tp') return path + "/" + spotFolderName + props.fromSpot.fromSpot.fromSrc_tp
})
const lineupSrc = computed(() => `/src/assets/content/lineups/${currentRoute.value}/${props.lineup.name}` + props.lineup.srcAim)
const toSrc = computed(() => {
    const path = `/src/assets/content/spots/${currentRoute.value}`
    const spotFolderName = camelcase(props.toSpot.toSpot.name)
    return path + "/" + spotFolderName + props.toSpot.toSpot.toSrc!
})
const iconSrc = computed(() => `/src/assets/icons/icon_${props.lineup.nadeType}.webp`)

const data = ref({
    fromImgHovered: false
})



</script>

<template>
    <article class="contentItem" :style="{ '--hsl': toSpot.hslColor }"
        @click="emit('lineupClicked', lineup.lineupId)">
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
                    <img class="figure__img" :src="fromSrc" alt="">
                </div>
                <figcaption class="figure__caption">
                    Stand there
                </figcaption>
            </figure>
            <figure class="figure">
                <div class="figure__imgCont">
                    <img class="figure__img" :src="lineupSrc" alt="">
                </div>
                <figcaption class="figure__caption">
                    Aim there
                </figcaption>
            </figure>
            <figure class="figure">
                <div class="figure__imgCont">
                    <img class="figure__img" :src="toSrc!" alt="">
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

    &:hover {
        background-color: hsla(var(--hsl), 77%, 25%, 0.7);
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