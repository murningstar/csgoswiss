<script setup lang="ts">
import { reactive } from 'vue';

const props = defineProps<{
    state: {
        isToggled: boolean,
        isActive: boolean,
        isMinimized: boolean,
    }
}>()
const emit = defineEmits(['toggle', 'toggleMode'])
</script>

<template>
    <div class="previewPanel" :style="{
        width: !state.isToggled ? '3rem' : '',
        minHeight: !state.isToggled ? '3rem' : '5rem',
    }">
        <header class="previewPanel__header">
            <h2 class="previewPanel__h2" v-if="state.isToggled">
                <img class="previewPanel__icon" src="@/assets/ui_logo_beta.webp"
                    alt="">
                <div class="previewPanel__title">Preview selected lineups</div>
            </h2>
            <div class="controlButtonsContainer">

                <button class="previewPanel__button" v-if="state.isToggled"
                    @click="() => { if (state.isMinimized) { emit('toggleMode') } }"
                    :style="{
                        borderTop: !state.isMinimized ? '1px solid var(--border_dark)' : '1px solid var(--border_light)',
                        borderLeft: !state.isMinimized ? '1px solid var(--border_dark)' : '1px solid var(--border_light)',
                        borderBottom: !state.isMinimized ? '1px solid var(--border_light)' : '1px solid var(--border_dark)',
                        borderRight: !state.isMinimized ? '1px solid var(--border_light)' : '1px solid var(--border_dark)'
                    }">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                        fill="white" :style="{
                            fill: state.isMinimized ? 'white' : 'rgb(255, 235, 63)',

                        }">
                        <path
                            d="M4,2 L20,2 C21.1045695,2 22,2.8954305 22,4 L22,12 C22,13.1045695 21.1045695,14 20,14 L4,14 C2.8954305,14 2,13.1045695 2,12 L2,4 C2,2.8954305 2.8954305,2 4,2 Z M4,4 L4,12 L20,12 L20,4 L4,4 Z M22,16 L22,18 L2,18 L2,16 L22,16 Z M22,20 L22,22 L2,22 L2,20 L22,20 Z"
                            fill-rule="evenodd" />
                    </svg>
                </button>

                <button class="previewPanel__button" v-if="state.isToggled" :style="{
                    borderTop: state.isMinimized ? '1px solid var(--border_dark)' : '1px solid var(--border_light)',
                    borderLeft: state.isMinimized ? '1px solid var(--border_dark)' : '1px solid var(--border_light)',
                    borderBottom: state.isMinimized ? '1px solid var(--border_light)' : '1px solid var(--border_dark)',
                    borderRight: state.isMinimized ? '1px solid var(--border_light)' : '1px solid var(--border_dark)'
                }">
                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"
                        fill="white" :style="{
                            fill: !state.isMinimized ? 'white' : 'rgb(255, 235, 63)',

                        }"
                        @click="() => { if (!state.isMinimized) { emit('toggleMode') } }">
                        <g data-name="Layer 2" id="Layer_2">
                            <path d="M28,10H4A1,1,0,0,1,4,8H28a1,1,0,0,1,0,2Z" />
                            <path d="M28,17H4a1,1,0,0,1,0-2H28a1,1,0,0,1,0,2Z" />
                            <path d="M28,24H4a1,1,0,0,1,0-2H28a1,1,0,0,1,0,2Z" />
                        </g>
                    </svg>
                </button>

                <button class="previewPanel__button" @click="emit('toggle')" :style="{
                    borderTop: state.isToggled ? '2px solid var(--border_light)' : '1px solid var(--border_light)',
                    borderLeft: state.isToggled ? '2px solid var(--border_light)' : '1px solid var(--border_light)',
                    borderBottom: state.isToggled ? '2px solid var(--border_light)' : '1px solid var(--border_dark)',
                    borderRight: state.isToggled ? '2px solid var(--border_light)' : '1px solid var(--border_dark)'
                }">
                    <svg v-if="state.isToggled" class="feather feather-minimize-2"
                        stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="2" viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg" :style="{
                            stroke: state.isActive ? 'rgb(255, 235, 63)' : 'white',
                        }">
                        <polyline points="4 14 10 14 10 20" />
                        <polyline points="20 10 14 10 14 4" />
                        <line x1="14" x2="21" y1="10" y2="3" />
                        <line x1="3" x2="10" y1="21" y2="14" />
                    </svg>
                    <svg v-if="!state.isToggled" class="feather feather-maximize-2"
                        stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="2" viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg" :style="{
                            stroke: state.isActive ? 'rgb(255, 235, 63)' : 'white'
                        }">
                        <polyline points="15 3 21 3 21 9" />
                        <polyline points="9 21 3 21 3 15" />
                        <line x1="21" x2="14" y1="3" y2="10" />
                        <line x1="3" x2="10" y1="21" y2="14" />
                    </svg>
                    <!-- <svg v-if="!state.isToggled" viewBox="0 0 64 64"
                        xmlns="http://www.w3.org/2000/svg">
                        <g data-name="Target" id="Target-2">
                            <circle class="cls-1" fill="#f64f7d" cx="31.5" cy="32.5"
                                r="28" />
                            <circle class="cls-2" fill="#e0e5eb" cx="31.5" cy="32.5"
                                r="21.73" />
                            <circle class="cls-1" fill="#f64f7d" cx="31.5" cy="32.5"
                                r="15.68" />
                            <circle class="cls-2" fill="#e0e5eb" cx="31.5" cy="32.5"
                                r="9.41" />
                            <circle class="cls-1" fill="#f64f7d" cx="31.5" cy="32.5"
                                r="3.74" />
                            <path class="cls-3" fill="#f8e157" fill-rule="evenodd"
                                d="M52.11,10.48v-6a1,1,0,0,1,2,0v4l.8-.8V4.5a1,1,0,0,1,2,0V7.1H59.5a1,1,0,0,1,0,2H56.32l-.79.79h4a1,1,0,0,1,0,2h-6L32.21,33.21a1,1,0,0,1-1.42-1.42Z" />
                        </g>
                    </svg> -->
                </button>

            </div>
        </header>
        <div class="previewPanel__content" v-if="state.isToggled" :style="{
            padding: !state.isActive ? '1rem' : '0',
            color: !state.isActive ? '#e44147' : 'white'
        }">
            <slot>
                Select lineup first
            </slot>
        </div>
    </div>
</template>

<style scoped lang="scss">
.previewPanel {
    @include gs-bd;
    background-color: rgba(76, 88, 68, 0.95);
    position: absolute;
    margin: 0.5rem;
    padding: 0.5rem;
    top: 0;
    right: 0;
    bottom: 0;
    max-height: 98%;
    height: fit-content;
    min-height: 5rem;
    // background-color: blue;
    display: flex;
    flex-direction: column;

    &__button {
        display: block;
        width: 2rem;
        height: 2rem;
        padding: 0.4rem;
        background-color: $bg_light;
        @include gs-bd;
        cursor: pointer;
        // z-index: 1;

        &:first-of-type {
            margin-left: 0.5rem;
        }

        &:last-of-type {
            margin-left: 0.5rem;
        }

        .svgToggle {
            fill-rule: evenodd;
            clip-rule: evenodd;
        }
    }

    &__h2 {
        display: flex;
        align-items: center;
        height: 37px;
        margin-right: 8rem;
    }

    &__icon {
        display: block;
        width: 17px;
        height: 17px;
        object-fit: contain;
        // border: 1px solid red;
    }

    &__title {
        color: white;
        margin-left: 4px;
        margin-right: 5px;
        font-size: 1rem;
        justify-self: flex-start;
        font-weight: normal;
    }

    &__content {
        display: flex;
        flex-direction: column;
        overflow-y: scroll;
        height: calc(100% - 37px);
        @include gs-bd-clicked;
    }
}

.controlButtonsContainer {
    position: absolute;
    top: 0.4rem;
    right: 0.4rem;
    // border: 1px solid red;
    display: flex;
}
</style>