<script setup lang="ts">
import { computed, ref, watch, reactive, onMounted, onUnmounted } from 'vue';
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import AddGrenadeForm from "@/components/cms/AddGrenadeForm.vue"
import CreateLineupForm from '@/components/cms/CreateLineupForm.vue';
import GS_Button from "@/components/UI/GS_Button.vue"
import GS_Check from "@/components/UI/GS_Check.vue"
import GS_Input from "@/components/UI/GS_Input.vue"
import GS_Window from '@/components/UI/GS_Window.vue';
import GS_ContainerLight from '@/components/UI/GS_ContainerLight.vue';
import { useMachine } from "@xstate/vue"
import { createMachine } from "xstate"
import { nanoid } from "nanoid"
import type { CoordsObj, Difficulty, ForWhom, NadeType, Side, ThrowClick, ThrowMovement, Tickrate } from '@/data/types/GrenadeProperties';
import type { Placeholder } from '@/data/interfaces/Placeholder'
import { nadeTypeList } from '@/data/nadeTypeList';
import { useSomestore } from '@/stores/somestore';
import { mirageGrenades } from '@/data/v2_spotSvyaz/mirage/mirageGrenadesV2';
import { ancientGrenades } from '@/data/v2_spotSvyaz/ancient/ancientGrenadesV2';
import { dust2Grenades } from '@/data/v2_spotSvyaz/dust2/dust2GrenadesV2';
import { infernoGrenades } from '@/data/v2_spotSvyaz/inferno/infernoGrenadesV2';
import { nukeGrenades } from '@/data/v2_spotSvyaz/nuke/nukeGrenadesV2';
import { overpassGrenades } from '@/data/v2_spotSvyaz/overpass/overpassGrenadesV2';
import { vertigoGrenades } from '@/data/v2_spotSvyaz/vertigo/vertigoGrenadesV2';
import type { MapItems } from '@/data/v2_spotSvyaz/MapItemsV2';
import { maplist } from '@/data/maplist';
import type { Spot } from '@/data/v2_spotSvyaz/Spot';
import { z } from 'zod'
import axios from 'axios';


/* Placeholder называется как называется, так как точка прилёта гранаты
при создании не имеет никакого типа. То есть она ни smoke, ни molotov и т.д. */
const placeholders = ref<Placeholder[]>([])

const someStore = useSomestore()

const route = useRoute()
const currentRoute = computed(() => route.path.slice(1))

/* Возможно нужно вынести склеивание этого объекта в отдельный файл и импортировать его,
если склеивание происходит каждый раз при загрузке приложения.*/
const allMapItems: any = {
    mirageGrenades,
    ancientGrenades,
    dust2Grenades,
    infernoGrenades,
    nukeGrenades,
    overpassGrenades,
    vertigoGrenades
}
const currentRouteMapItems = computed(() => {
    if (maplist.includes(currentRoute.value)) {
        return allMapItems[`${currentRoute.value}Grenades`] as MapItems
    }
    else {
        return { lineups: new Map(), spots: new Map() } as MapItems
    }
})
// Сделал каждой гранате текущей карты по computed для визуального облегчения template
// const smokes = computed(() => currentRouteMapItems.value.smokes)
// const molotovs = computed(() => currentRouteMapItems.value.molotovs)
// const flashes = computed(() => currentRouteMapItems.value.flashes)
// const hes = computed(() => currentRouteMapItems.value.hes)
// const throwSpots = computed(() => currentRouteMapItems.value.throwSpots)
const currentRouteSpots = computed(() => currentRouteMapItems.value.spots)
const lineups = computed(() => currentRouteMapItems.value.lineups)
const hint = computed(() => {
    if (state.value.matches('shadowmapOn.selectingToSpot')) { return 'Choose land spot first (or create new)' }
    if (state.value.matches('shadowmapOn.selectingFromSpot')) { return 'Choose throw spot (or create new)' }
})



const cmsStateMachine = createMachine<{
    clickedPhIx: number | undefined
    // undefined явно показывает, что в текущий момент времени может быть не нажат никакой Placeholder
}>({
    initial: "shadowmapOff",
    context: {
        // Индекс спота, с которым сейчас происходит взаимодействие.
        clickedPhIx: undefined,
    },
    states: {
        shadowmapOff: {
            id: "shadowmapOff",
            on: {
                TOGGLE: "shadowmapOn"
            },
        },
        shadowmapOn: {
            id: "shadowmapOn",
            initial: "selectingToSpot",
            states: {
                selectingToSpot: {
                    id: "selectingToSpot",
                    on: {
                        TOGGLE: "#shadowmapOff",
                        CLICK_ON_TOSPOT: "selectingFromSpot",
                        CREATE_NEW_SPOT: "creatingNewSpot",

                        CLICK_ON_PLACEHOLDER: "typingPlaceholder",
                        CLICK_ON_PLACEHOLDER_SMOKE: "typingPlaceholder.smoke",
                        CLICK_ON_PLACEHOLDER_MOLOTOV: "typingPlaceholder.molotov",
                        CLICK_ON_PLACEHOLDER_FLASH: "typingPlaceholder.flash",
                        CLICK_ON_PLACEHOLDER_HE: "typingPlaceholder.he",
                        EDIT_OLD: "editingOld"
                    },
                    entry: (context) => {
                        context.clickedPhIx = undefined;
                        newLineupProps.value.toSpot = null
                    }
                },
                selectingFromSpot: {
                    id: "selectingFromSpot",
                    on: {
                        CLICK_ON_FROMSPOT: "creatingLineup",
                        CLICK_ON_SELECTED_TOSPOT: "selectingToSpot",
                        CREATE_NEW_SPOT: "creatingNewSpot",
                    },
                    entry: () => { newLineupProps.value.fromSpot = null },
                },
                creatingNewSpot: {
                    id: "creatingNewSpot",
                    on: {
                        EXIT: "selectingToSpot"
                    }
                },
                creatingLineup: {
                    id: "creatingLineup",
                    on: {
                        EXIT: "selectingFromSpot"
                    }
                },
                typingPlaceholder: {
                    id: "typingPlaceholder",
                    initial: "choosingType",
                    onDone: "#shadowmapOff",
                    entry: (context, event) => {
                        // payload of send(), т.е. индекс(важно, не идентификатор) кликнутого placeholder присваивается в текущий_кликнутый_индекс
                        context.clickedPhIx = event.phIndex
                    },
                    states: {
                        choosingType: {
                            id: "choosingType",
                            // entry: () => { clickedPlaceholder.value.type = '' },
                            on: {
                                ADD_SMOKE: "smoke",
                                ADD_MOLOTOV: "molotov",
                                ADD_FLASH: "flash",
                                ADD_HE: "he",
                                BACK: "#shadowmapOn"
                            }
                        },
                        smoke: {
                            id: "smoke",
                            on: {
                                SAVE: "saved",
                                BACK: "choosingType",
                                COLLAPSE: "#shadowmapOn"
                            }
                        },
                        molotov: {
                            id: "molotov",
                            on: {
                                SAVE: "saved",
                                BACK: "choosingType",
                                COLLAPSE: "#shadowmapOn"
                            }
                        },
                        flash: {
                            id: "flash",
                            on: {
                                SAVE: "saved",
                                BACK: "choosingType",
                                COLLAPSE: "#shadowmapOn"
                            }
                        },
                        he: {
                            id: "he",
                            on: {
                                SAVE: "saved",
                                BACK: "choosingType",
                                COLLAPSE: "#shadowmapOn"
                            }
                        },
                        saved: {
                            id: "saved",
                            type: 'final',
                            entry: () => {
                                setTimeout(() => {
                                    window.location.reload()
                                }, 100);
                            },

                        }
                    }
                },
                editingOld: {

                }
            }
        },
    }
})

const isDragging = ref(false)

const { state, send } = useMachine(cmsStateMachine)

const buttonContent = computed(() => state.value.matches('shadowmapOn') ? 'x' : '+')
const buttonBgColor = computed(() => state.value.matches('shadowmapOn') ? 'indianred' : 'aqua')

// Клик по пустому месту на карте - добавление нового Placeholder в массив
function pushNewPlaceholder(event: MouseEvent) {
    if (isDragging.value === false && event.currentTarget == event.target) {
        let boundClRect = (event.currentTarget as HTMLDivElement).getBoundingClientRect()
        let clickOnRect_x = event.clientX - boundClRect.left
        let clickOnRect_y = event.clientY - boundClRect.top
        let clickOnRect_xPercent = (clickOnRect_x * 100) / boundClRect.width
        let clickOnRect_yPercent = (clickOnRect_y * 100) / boundClRect.height

        newToSpotData.value = {
            spotId: nanoid(13),
            name: '',
            coords: {
                x: Number(clickOnRect_xPercent.toFixed(1)),
                y: Number(clickOnRect_yPercent.toFixed(1))
            },
            toImg: null,
            fromImg: null
        }
        send('CREATE_NEW_SPOT')

        /* placeholders.value.push({
            id: nanoid(13),
            coords: {
                x: clickOnRect_xPercent,
                y: clickOnRect_yPercent
            },
            type: '',
        }) */
    }
}

function onClickPlaceholder(phId: string) {
    /* Аргумент - placeholder.id(полученный из v-for="Placeholder in Placeholders") 
    Нажатия по этому споту - переход на выбор типа для этого спота*/

    // phIndex передаваемый в send почему-то подсвечивается белым а не оранж, хотя это 100% он.
    let phIndex = placeholders.value.findIndex((placeholder) => {
        return placeholder.id == phId
    })
    if (isDragging.value === false) {
        if (placeholders.value[phIndex].type === '') {
            send({ type: 'CLICK_ON_PLACEHOLDER', phIndex })
        }
        else {
            send({ type: `CLICK_ON_PLACEHOLDER_${placeholders.value[phIndex].type.toUpperCase()}`, phIndex })
        }
    }
}
function nadeTypeOnClick(nadeType: string) {
    /* Функция отрабатывает только во время выбора типа гранаты для пустого Placeholder'а */
    /* В контексте xstate всегда хранится копия Placeholdera, показывающая с каким объектом
    мы сейчас работаем. Чтобы изменить оригинальный объект, ищем его индекс по id объекта-копии
    (из контекста xstate). А затем заменяем его type на nadeType(аргумент ф-ии) */
    placeholders.value[state.value.context.clickedPhIx!].type = nadeType
    send(`ADD_${nadeType}`.toUpperCase())
}
function getShadowColor(placeholderType: string) {
    switch (placeholderType) {
        case '':
            return `0 0 5px 7px rgba(85, 0, 255, 0.702)`
        case 'Smoke':
            return `0 0 5px 7px rgba(216, 218, 222, 0.702)`
        case 'Molotov':
            return `0 0 5px 7px rgba(255, 21, 0, 0.702)`
        case 'Flash':
            return `0 0 5px 7px rgba(255, 231, 110, 0.702)`
        case 'He':
            return `0 0 5px 7px rgba(26, 255, 0, 0.702)`
    }
}
function getBgColor(placeholderType: string) {
    switch (placeholderType) {
        case '':
            return `rgba(0, 0, 0, 0.801)`
        case 'Smoke':
            return `rgba(255, 255, 255, 0.801)`
        case 'Molotov':
            return `rgba(255, 85, 0, 0.801)`
        case 'Flash':
            return `rgba(255, 230, 0, 0.801)`
        case 'He':
            return `rgba(0, 49, 0, 0.801)`
    }
}

function deletePlaceholder(rightClickedPlaceholder: Placeholder) {
    placeholders.value.splice(
        placeholders.value.findIndex((placeholderObj) => placeholderObj.id == rightClickedPlaceholder.id),
        1
    )
}
const smokeFormOn = computed(() => state.value.matches("shadowmapOn.typingPlaceholder.smoke"))
const molotovFormOn = computed(() => state.value.matches("shadowmapOn.typingPlaceholder.molotov"))
const flashFormOn = computed(() => state.value.matches("shadowmapOn.typingPlaceholder.flash"))
const heFormOn = computed(() => state.value.matches("shadowmapOn.typingPlaceholder.he"))
const formState = reactive({ smokeFormOn, molotovFormOn, flashFormOn, heFormOn })

const addGrenadeFormHandlers = {
    updateType: (newVal: string) => { placeholders.value[state.value.context.clickedPhIx!].type = newVal },
    updateName: (newVal: string) => { placeholders.value[state.value.context.clickedPhIx!].name = newVal },
    updateSide: (newVal: Side) => { placeholders.value[state.value.context.clickedPhIx!].side = newVal },
    updateTickrate: (newVal: Tickrate) => { placeholders.value[state.value.context.clickedPhIx!].tickrate = newVal },
    updateThrowClick: (newVal: ThrowClick) => { placeholders.value[state.value.context.clickedPhIx!].throwClick = newVal },
    updateThrowMovement: (newVal: ThrowMovement) => { placeholders.value[state.value.context.clickedPhIx!].throwMovement = newVal },
    updateDifficulty: (newVal: Difficulty) => { placeholders.value[state.value.context.clickedPhIx!].difficulty = newVal },

    updateIsOnewaySmoke: (newVal: boolean) => { placeholders.value[state.value.context.clickedPhIx!].isOnewaySmoke = newVal },
    updateIsFakeSmoke: (newVal: boolean) => { placeholders.value[state.value.context.clickedPhIx!].isFakeSmoke = newVal },
    updateIsBugSmoke: (newVal: boolean) => { placeholders.value[state.value.context.clickedPhIx!].isBugSmoke = newVal },
    updateForWhom: (newVal: ForWhom) => { placeholders.value[state.value.context.clickedPhIx!].forWhom = newVal },
    updateIsOnewayMolotov: (newVal: boolean) => { placeholders.value[state.value.context.clickedPhIx!].isOnewayMolotov = newVal },
    updateIsFakeMolotov: (newVal: boolean) => { placeholders.value[state.value.context.clickedPhIx!].isFakeMolotov = newVal },
    updateIsBugMolotov: (newVal: boolean) => { placeholders.value[state.value.context.clickedPhIx!].isBugMolotov = newVal },
    updateIsBugHe: (newVal: boolean) => { placeholders.value[state.value.context.clickedPhIx!].isBugHe = newVal },
}


onMounted(() => {
    window.onbeforeunload = (e) => {
        if (placeholders.value.length > 0) {
            e.preventDefault()
            return ''
        }
    }
    setTimeout(() => {
        console.log(state.value.value);
    }, 5000)
})
onUnmounted(() => {
    window.onbeforeunload = null
})

function toggleCms() {
    send('TOGGLE')
    someStore.toggleCmsMode()
}
function shadowMapOnMouseOver(event: MouseEvent) {
    if ((event.target as HTMLDivElement).className == "shadowMap") {
        cursorCircleVisible.value = true
        console.log('should be visible now');
    } else {
        cursorCircleVisible.value = false
    }
}
function cursorOnMove(ev: MouseEvent) {
    if (cursorCircleRef.value) {
        cursorCircleRef.value.style.top = ev.clientY + 'px'
        cursorCircleRef.value.style.left = ev.clientX + 'px'
    }
}
function shadowMapOnMouseOut(event: MouseEvent) {
    cursorCircleVisible.value = false
}
function log() {
    console.log(123);
}

const cursorCircleVisible = ref(false)
const cursorCircleRef = ref(null)

async function submitNewSpot() {

    if (!newToSpotData.value!.toImg && !newToSpotData.value!.fromImg) {
        return alert('Нужно залить минимум одну из картинок')
    }
    const formData = new FormData()
    formData.append('spotId', newToSpotData.value!.spotId)
    formData.append('name', newToSpotData.value!.name)
    formData.append('coords', JSON.stringify(newToSpotData.value!.coords))
    const toImg = newToSpotData.value!.toImg as Blob
    const fromImg = newToSpotData.value!.fromImg as Blob
    const name = newToSpotData.value!.name
    if (toImg) {
        formData.append('toImgFile', toImg)
    }
    if (fromImg) {
        formData.append('fromImgFile', fromImg)
    }
    const res = await axios.postForm(`http://localhost:7351/spots/${currentRoute.value}`, formData)
    // console.log(res);
}
function onClickExit() {
    send('EXIT')
}
const newToSpotData = ref<{
    spotId: string,
    name: string,
    coords: {
        x: number,
        y: number
    },
    toImg: File | null,
    fromImg: File | null,
}>()

function onChangeFileInput(e: Event, direction: 'to' | 'from') {
    const target = e.target as HTMLInputElement
    const files = target.files
    if (!files) { // если пользователь отменил добавление картинки
        if (direction == 'to') { newToSpotData.value!.toImg = null }
        if (direction == 'from') { newToSpotData.value!.fromImg = null }
        return
    }
    if (files) { // если добавлена картинка
        if (direction == 'to') { newToSpotData.value!.toImg = target.files![0] }
        if (direction == 'from') { newToSpotData.value!.fromImg = target.files![0] }
        return
    }
}
const newLineupProps = ref<{
    toSpot: Spot | null,
    fromSpot: Spot | null,
}>({
    toSpot: null,
    fromSpot: null,
})

function spotOnClick(spot: Spot) {
    if (state.value.matches("shadowmapOn.selectingToSpot")) {
        newLineupProps.value.toSpot = spot
        send('CLICK_ON_TOSPOT')
        return
    }
    if (state.value.matches("shadowmapOn.selectingFromSpot")) {
        newLineupProps.value.fromSpot = spot
        send('CLICK_ON_FROMSPOT')
        return
    }
}
function exitLineupCreation() {
    send('EXIT')
    newLineupProps.value.fromSpot = null
}

</script>


<template>
    <div class="shadowMap" v-if="state.matches('shadowmapOn')"
        @mousedown="isDragging = false"
        @mousemove="$event => { isDragging = true; cursorOnMove($event) }"
        @mouseover="$event => shadowMapOnMouseOver($event)"
        @mouseup.left="$event => pushNewPlaceholder($event)"
        @mouseout="shadowMapOnMouseOut">

        <!-- hint -->
        <Teleport to="body">
            <div class="hint">
                {{ hint }}
            </div>
        </Teleport>

        <!-- display selected spots -->
        <Teleport to="body">
            <div class="selectedList">
                <p>toSpot: {{ newLineupProps.toSpot?.name || 'undefined' }}</p>
                <p>fromSpot: {{ newLineupProps.fromSpot?.name || 'undefined' }}</p>
            </div>
        </Teleport>

        <!-- red cursor dot -->
        <Teleport to="body">
            <div ref="cursorCircleRef" class="cursorCircle"
                v-if="cursorCircleVisible">
            </div>
        </Teleport>

        <!-- red spots -->
        <div class="cmsSpot" v-for=" [spotId, spot]  in  currentRouteSpots "
            @click="spotOnClick(spot)" :style="{
                top: `${spot.coords.y}%`,
                left: `${spot.coords.x}%`,
            }">
        </div>

        <!-- placeholders -->
        <div class="placeholder" v-for=" placeholder  in  placeholders " :style="{
            top: `${placeholder.coords.y}%`,
            left: `${placeholder.coords.x}%`,
            boxShadow: getShadowColor(placeholder.type),
            backgroundColor: getBgColor(placeholder.type)
        }
            " @click.left="onClickPlaceholder(placeholder.id)"
            @contextmenu.prevent="deletePlaceholder(placeholder)">
        </div>

        <!-- Модалка для выбора типа гранаты -->
        <Teleport to="body">
            <GS_Window
                v-if="state.matches('shadowmapOn.typingPlaceholder.choosingType')"
                @exit="send('BACK')">
                <template #title>
                    Choose nade type
                </template>
                <div class="chooseContainer">
                    <GS_Button @click="nadeTypeOnClick('Smoke')">
                        Smoke
                        <img src="@/assets/icons/icon_smoke.webp" alt="SmokeImg"
                            style="max-height: 15px;">
                    </GS_Button>
                    <GS_Button @click="nadeTypeOnClick('Molotov')">
                        Molotov
                        <img src="@/assets/icons/icon_molotov.webp" alt="MolotovImg"
                            style="max-height: 15px; scale: 1.5;">
                    </GS_Button>
                    <GS_Button @click="nadeTypeOnClick('Flash')">
                        Flash
                        <img src="@/assets/icons/icon_flash.webp" alt="FlashImg"
                            style="max-height: 15px;">
                    </GS_Button>
                    <GS_Button @click="nadeTypeOnClick('He')">
                        He
                        <img src="@/assets/icons/icon_he.webp" alt="HeImg"
                            style="max-height: 15px;">
                    </GS_Button>
                </div>
            </GS_Window>


            <!-- Кнопка step back -->
            <div class="backBtn" @click="send('BACK')"
                v-if="state.matches('shadowmapOn.typingPlaceholder')">
                ←
            </div>
        </Teleport>

        <!-- createSpotForm -->
        <Teleport to="body">
            <GS_Window v-if="state.matches('shadowmapOn.creatingNewSpot')"
                @exit="send('EXIT')">
                <template #title>Create new spot</template>
                <GS_ContainerLight>
                    <p style="color:grey"> Id:{{ newToSpotData!.spotId }} </p>

                    <p>Enter new spot's name</p>
                    <GS_Input :modelValue="newToSpotData!.name"
                        @update:modelValue="nv => newToSpotData!.name = nv" />

                    <p>To image (landing image)</p>
                    <input type="file" name="toImgFile" id=""
                        accept="image/*,.png,.jpg,.jpeg,.webp"
                        @change="$event => onChangeFileInput($event, 'to')"
                        style="display: block;">

                    <p>From image (throwing image)</p>
                    <input type="file" name="fromImgFile" id=""
                        accept="image/*,.png,.jpg,.jpeg,.webp"
                        @change="$event => onChangeFileInput($event, 'from')"
                        style="display: block;">

                    <div style="display: flex; margin-top: 2rem;">
                        <GS_Button @click="submitNewSpot"> Submit </GS_Button>
                        <GS_Button @click="onClickExit">Exit(and delete)</GS_Button>
                    </div>
                </GS_ContainerLight>
            </GS_Window>
        </Teleport>

        <!-- createLineupForm -->
        <CreateLineupForm :isVisible="state.matches('shadowmapOn.creatingLineup')"
            :newLineupData="newLineupProps" @exit="exitLineupCreation" />

        <Teleport to="body">
            <GS_Window v-if="state.matches('shadowmapOn.creatingLineup') && false"
                @exit="send('EXIT')">
                <template #title>Create new Lineup</template>
                <GS_ContainerLight>
                    <p style="color:grey"> Id:{{ newLineupProps.lineupId }} </p>

                    <p>To image (landing image)</p>
                    <input type="file" name="toImgFile" id=""
                        accept="image/*,.png,.jpg,.jpeg,.webp"
                        @change="$event => onChangeFileInput($event, 'to')"
                        style="display: block;">

                    <div style="display: flex; margin-top: 2rem;">
                        <GS_Button @click="submitNewSpot"> Submit </GS_Button>
                        <GS_Button @click="onClickExit">Exit(and delete)</GS_Button>
                    </div>
                </GS_ContainerLight>
            </GS_Window>
        </Teleport>

        <!-- Формы для вписывания данных новой гранаты -->
        <AddGrenadeForm @exit="send('COLLAPSE')" v-bind="formState"
            v-if="smokeFormOn || molotovFormOn || flashFormOn || heFormOn"
            :clickedPlaceholder="placeholders[state.context.clickedPhIx!]"
            :clickedPhIx="state.context.clickedPhIx"
            @update:typeValue="addGrenadeFormHandlers.updateType"
            @update:nameValue="addGrenadeFormHandlers.updateName"
            @update:throwSpotsIdsValue="(newVal: any) => { }"
            @update:sideValue="addGrenadeFormHandlers.updateSide"
            @update:tickrateValue="addGrenadeFormHandlers.updateTickrate"
            @update:comboIdsValue="(newVal: any) => { }"
            @update:throwClickValue="addGrenadeFormHandlers.updateThrowClick"
            @update:throwMovementValue="addGrenadeFormHandlers.updateThrowMovement"
            @update:difficultyValue="addGrenadeFormHandlers.updateDifficulty"
            @update:isOnewaySmokeValue="addGrenadeFormHandlers.updateIsOnewaySmoke"
            @update:isFakeSmokeValue="addGrenadeFormHandlers.updateIsFakeSmoke"
            @update:isBugSmokeValue="addGrenadeFormHandlers.updateIsBugSmoke"
            @update:forWhomValue="addGrenadeFormHandlers.updateForWhom"
            @update:isOnewayMolotovValue="addGrenadeFormHandlers.updateIsOnewayMolotov"
            @update:isFakeMolotovValue="addGrenadeFormHandlers.updateIsFakeMolotov"
            @update:isBugMolotovValue="addGrenadeFormHandlers.updateIsBugMolotov"
            @update:isBugHeValue="addGrenadeFormHandlers.updateIsBugHe" />
    </div>

    <!-- вкл/выкл CMS; вне div, т.к. отвечает за его отображение -->
    <Teleport to="body">
        <div class="toggleCMSbtn" :style="{ backgroundColor: buttonBgColor }"
            @click="toggleCms">
            {{ buttonContent }}
        </div>
    </Teleport>
</template>


<style scoped lang="scss">
.cursorCircle {
    position: fixed;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background-color: rgba(255, 0, 0, 1);
    transform: translate(-50%, -50%);
    pointer-events: none;
}

.cmsSpot {
    width: 0.7%;
    height: 0.7%;
    position: absolute;
    background-color: rgb(255, 0, 0);
    filter: drop-shadow(0px 0px 1px yellow);
    border-radius: 50%;
    transform: translate(-50%, -50%);

    &:hover {
        background-color: rgb(255, 123, 0);
    }
}

.hint {
    position: fixed;
    width: 30%;
    top: 50px;
    left: 50%;
    translate: -50%;
    background-color: rgb(230, 173, 173);
    color: black;
    box-shadow: 0 0 3px 1px rgb(255, 0, 0);
}

.selectedList {
    position: fixed;
    width: 30%;
    bottom: 50px;
    left: 50%;
    translate: -50%;
    background-color: rgb(230, 173, 173);
    color: black;
    box-shadow: 0 0 3px 1px rgb(255, 0, 0);
}

.toggleCMSbtn {
    position: fixed;
    top: 10px;
    right: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
    padding: 0;
    width: 33px;
    height: 33px;
    border-radius: 10px;
    border: 3px solid rgb(0, 0, 0);
    font-size: 18px;
    font-weight: bold;
    box-shadow: 0 0 30px black;
    filter: saturate(0.5);
    cursor: pointer;

    &:hover {
        color: white;
        text-shadow: 0 0 2px #00000081;
        filter: saturate(1);
    }
}

.shadowMap {
    background-color: rgba(38, 0, 255, 0.133);
    // box-shadow: inset 0 0 500px -10px rgba(255, 226, 147, 0.25), 0 0 21px 7px rgba(3, 14, 53, 0.26);
    width: 100%;
    height: 100%;
    position: absolute;
    cursor: pointer;
}

.backBtn {
    position: fixed;
    top: 10px;
    right: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
    padding: 0;
    width: 50px;
    height: 50px;
    border: 3px solid rgb(0, 0, 0);
    background-color: #ff0000;
    font-size: 18px;
    font-weight: bold;
    z-index: 1;
    cursor: pointer;
    color: white;
}

.chooseContainer {
    display: flex;

    &>* {
        flex: 1 1 0px;
        margin-left: 8px;
    }

    &:last-child {
        margin-right: 8px;
    }
}

.placeholder {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    border: rgb(122, 122, 122) 1px solid;
    transform-origin: top left;

    &:hover {
        background-color: black;
        border: 1px dashed white;
        animation: rotateSprite 5s linear infinite;
        scale: 1.1;

        @keyframes rotateSprite {
            from {
                rotate: 0deg;
            }

            to {
                rotate: 360deg;
            }
        }
    }
}

.bgDarker {
    top: 0;
    left: 0;
    position: fixed;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
}
</style>