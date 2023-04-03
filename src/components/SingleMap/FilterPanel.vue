<script setup lang="ts">
import GS_Select from '@/components/UI/GS_Select.vue';
import GS_Radio from '@/components/UI/GS_Radio.vue';
import GS_MultiCheck from '@/components/UI/GS_MultiCheck.vue';
import GS_Switch from '@/components/UI/GS_Switch.vue';
import { computed } from 'vue';
import type { Difficulty, ForWhom, NadeType, Side, Tickrate } from '@/data/types/GrenadeProperties';

// const props = defineProps({
//     isFiltersVisible: Boolean,
//     filtersPropData: Object,
//     selectedNadeType:String
// })
const props = defineProps<{
    isFiltersVisible: boolean,
    filtersPropData: {
        nadeTypeList: string[]
    },
    filterState: {
        nadeType: NadeType | "all",
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
    }

}>()
const emit = defineEmits([
    'toggle',
    'changeNadeType',
    'changeSide',
    'changeTickrate',
    'changeDifficulty',
    'changeOnewaySmoke',
    'changeFakeSmoke',
    'changeBugSmoke',
    'changeForWhom',
    'changeOnewayMolotov',
    'changeFakeMolotov',
    'changeBugMolotov',
    'changeBugHe',
])
const trueCounter = computed(() => {
    // //Difficulties multiselect 
    // let counter = 0;
    // for (let flagName in props.filterState.difficultiesState) {
    //     if (
    //         props.filterState.difficultiesState[flagName as keyof typeof props.filterState.difficultiesState]
    //         === true
    //     ) {
    //         counter++
    //     }
    // }
    // return counter
    return props.filterState.difficulties.size
})
function changeOnewaySmoke(newVal: string) {
    emit('changeOnewaySmoke', newVal);
}
function changeFakeSmoke(newVal: string) {
    emit('changeFakeSmoke', newVal);
}
function changeBugSmoke(newVal: string) {
    emit('changeBugSmoke', newVal);
}
function changeOnewayMolotov(newVal: string) {
    emit('changeOnewayMolotov', newVal);
}
function changeFakeMolotov(newVal: string) {
    emit('changeFakeMolotov', newVal);
}
function changeBugMolotov(newVal: string) {
    emit('changeBugMolotov', newVal);
}
function changeBugHe(newVal: string) {
    emit('changeBugHe', newVal);
}

function log(message: string, value: any) {
    console.log(message + ' ' + value);
}
</script>

<template>
    <div class="filters">
        <button class="filters__toggle" @click="emit('toggle')" :style="{
            backgroundColor: isFiltersVisible ? 'rgb(223, 202, 63)' : 'rgb(76, 88, 68)',
            border: isFiltersVisible ? '2px solid var(--border_light)' : ''
        }">
            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                viewBox="0 0 122.23 122.88"
                style="enable-background:new 0 0 122.23 122.88"
                xml:space="preserve">
                <g>
                    <path class="svgToggle"
                        :fill="isFiltersVisible ? 'white' : '#d8ded3'"
                        d="M122.23,12.35v10.54c0,1.29-1.21,2.35-2.69,2.35H77.85c-2.84,5.92-8.89,10.01-15.9,10.01 c-7,0-13.05-4.09-15.89-10.01H2.69C1.22,25.24,0,24.18,0,22.89V12.35C0,11.06,1.21,10,2.69,10h43.37c2.84-5.92,8.89-10,15.89-10 c7,0,13.05,4.09,15.89,10h41.69C121.02,10,122.23,11.06,122.23,12.35L122.23,12.35L122.23,12.35z M49.57,112.88 c-2.84,5.92-8.89,10-15.9,10c-7,0-13.05-4.08-15.89-10l-15.09,0c-1.48,0-2.69-1.06-2.69-2.35V99.99c0-1.29,1.21-2.35,2.69-2.35 l15.09,0c2.84-5.92,8.89-10.01,15.89-10.01c7,0,13.05,4.09,15.89,10.01h69.97c1.48,0,2.69,1.06,2.69,2.35v10.54 c0,1.29-1.22,2.35-2.69,2.35L49.57,112.88L49.57,112.88z M104.12,69.73c-2.84,5.92-8.89,10.01-15.89,10.01 c-7,0-13.05-4.09-15.9-10.01H2.69C1.22,69.73,0,68.67,0,67.38V56.85c0-1.29,1.21-2.35,2.69-2.35h69.64c2.84-5.92,8.89-10,15.89-10 c7,0,13.05,4.09,15.89,10h15.42c1.48,0,2.69,1.06,2.69,2.35v10.53c0,1.29-1.21,2.35-2.69,2.35H104.12L104.12,69.73z" />
                </g>
            </svg>
        </button>
        <div class="filters__wrapper" v-show="isFiltersVisible">
            <header class="filters__header">
                Filters
            </header>
            <menu class="menu">
                <li>
                    <div class="menu__element">
                        <GS_Select :selected="filterState.nadeType"
                            :options="filtersPropData.nadeTypeList"
                            @update:modelValue="(newVal) => { emit('changeNadeType', newVal) }" />
                        <div class="menu__label">Grenade Type</div>
                    </div>
                </li>
                <li>
                    <div class="menu__element">
                        <GS_Radio :options="['ct', 't']"
                            :modelValue="filterState.side" :radioName="'sideRadio'"
                            @update:modelValue="(newVal) => { emit('changeSide', newVal) }" />
                        <div class="menu__label">Side</div>
                    </div>
                </li>
                <li>
                    <div class="menu__element">
                        <GS_Radio :options="[64, 128]"
                            :modelValue="filterState.tickrate"
                            :radioName="'tickrateRadio'"
                            @update:modelValue="(newVal) => { emit('changeTickrate', newVal) }" />
                        <div class="menu__label">Tickrate</div>
                    </div>
                </li>
                <li>
                    <div class="menu__element">
                        <GS_MultiCheck :options="[
                            'easy',
                            'normal',
                            'medium',
                            'hard',
                            'pixelPerfect'
                        ]" :modelValue="filterState.difficulties"
                            @update:modelValue="(option, value) => {
                                emit('changeDifficulty', option, value)
                            }" />
                        <div class="menu__label">
                            Difficulty
                            (<span :class="{ lowCount: trueCounter < 1 }">
                                {{ trueCounter }}
                            </span>)
                        </div>
                    </div>
                </li>
                <li v-show="filterState.nadeType === 'smoke'">
                    <div class="menu__element">
                        <GS_Switch :options="[
                            'Oneways only',
                            'All',
                            'Regular only'
                        ]" :modelValue="filterState.onewaySmokeOption"
                            @update:modelValue="changeOnewaySmoke" />
                        <!-- <div class="menu__label"></div> -->
                    </div>
                </li>
                <li v-show="filterState.nadeType === 'smoke'">
                    <div class="menu__element">
                        <GS_Switch :options="[
                            'Fake smokes only',
                            'All',
                            'Regular only'
                        ]" :modelValue="filterState.fakeSmokeOption"
                            @update:modelValue="changeFakeSmoke" />
                        <!-- <div class="menu__label"></div> -->
                    </div>
                </li>
                <li v-show="filterState.nadeType === 'smoke'">
                    <div class="menu__element">
                        <GS_Switch :options="[
                            'Bug smokes only',
                            'All',
                            'Regular only'
                        ]" :modelValue="filterState.bugSmokeOption"
                            @update:modelValue="changeBugSmoke" />
                        <!-- <div class="menu__label"></div> -->
                    </div>
                </li>
                <li v-show="filterState.nadeType === 'molotov'">
                    <div class="menu__element">
                        <GS_Switch :options="[
                            'Oneway molotovs only',
                            'All',
                            'Regular only'
                        ]" :modelValue="filterState.onewayMolotovOption"
                            @update:modelValue="changeOnewayMolotov" />
                        <div class="menu__label"></div>
                    </div>
                </li>
                <li v-show="filterState.nadeType === 'molotov'">
                    <div class="menu__element">
                        <GS_Switch :options="[
                            'Fake molotovs only',
                            'All',
                            'Regular only'
                        ]" :modelValue="filterState.fakeMolotovOption"
                            @update:modelValue="changeFakeMolotov" />
                        <div class="menu__label"></div>
                    </div>
                </li>
                <li v-show="filterState.nadeType === 'molotov'">
                    <div class="menu__element">
                        <GS_Switch :options="[
                            'Bug molotovs only',
                            'All',
                            'Regular only'
                        ]" :modelValue="filterState.bugMolotovOption"
                            @update:modelValue="changeBugMolotov" />
                        <div class="menu__label"></div>
                    </div>
                </li>
                <li v-show="filterState.nadeType === 'flash'">
                    <div class="menu__element">
                        <GS_Radio :options="['yourself', 'teammate']"
                            :modelValue="filterState.forWhom"
                            :radioName="'forWhomRadio'"
                            @update:modelValue="(newVal) => { emit('changeForWhom', newVal) }" />
                        <div class="menu__label">For whom?</div>
                    </div>
                </li>
                <li v-show="filterState.nadeType === 'he'">
                    <div class="menu__element">
                        <GS_Switch :options="[
                            `Bug HEs only`,
                            'All',
                            'Regular only'
                        ]" :modelValue="filterState.bugHeOption"
                            @update:modelValue="changeBugHe" />
                        <div class="menu__label"></div>
                    </div>
                </li>
            </menu>
        </div>
    </div>
</template>

<style scoped lang="scss">
.filters {
    position: absolute;
    top: 0;
    left: 0;
    margin: 0.5rem;

    &__toggle {
        position: absolute;
        display: block;
        width: 2rem;
        height: 2rem;
        padding: 0.4rem;
        background-color: $bg_light;
        @include gs-bd;
        cursor: pointer;
        // z-index: 1;

        .svgToggle {
            fill-rule: evenodd;
            clip-rule: evenodd;
        }
    }

    &__wrapper {
        @include gs-bd;
        background-color: rgba(76, 88, 68, 0.777);
        min-width: 17.5rem;
    }

    &__header {
        display: flex;
        align-items: center;
        height: 2rem;
        margin-left: 2.4rem;
    }



}

.menu {
    background-color: rgba(76, 88, 68, 0.777);
    list-style: none;
    border-top: 1px solid $border_dark;
    padding: 0.5rem;

    // li {}

    &__element {
        display: flex;
        align-items: center;
        margin-bottom: 0.6rem;
    }

    &__label {
        margin-left: 0.4rem;
    }
}

.lowCount {
    color: rgba(255, 74, 83, 0.771);
}
</style>