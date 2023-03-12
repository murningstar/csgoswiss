<script setup lang="ts">
import { computed, ref, watch, reactive, onMounted, onUnmounted } from 'vue';
import { onBeforeRouteLeave } from 'vue-router'
import AddGrenadeForm from "@/components/cms/AddGrenadeForm.vue"
import GS_Button from "@/components/UI/GS_Button.vue"
import GS_Check from "@/components/UI/GS_Check.vue"
import GS_Input from "@/components/UI/GS_Input.vue"
import GS_Window from '@/components/UI/GS_Window.vue';
import { useMachine } from "@xstate/vue"
import { createMachine } from "xstate"
import type { CoordsObj, Difficulty, ForWhom, Side, ThrowClick, ThrowMovement, Tickrate } from '@/data/types/GrenadeProperties';
import type { Placeholder } from '@/data/interfaces/Placeholder'

/* Placeholder называется как называется, так как точка прилёта гранаты
при создании не имеет никакого типа. То есть она ни smoke, ни molotov и т.д. */
const placeholders = ref<Placeholder[]>([])

const cmsStateMachine = createMachine<{
    clickedPhIx: number | undefined
    /* undefined явно показвает, что в текущий момент времени может быть не нажат никакой Placeholder */
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
            initial: "idle",
            states: {
                idle: {
                    id: "idle",
                    on: {
                        TOGGLE: "#shadowmapOff",
                        CLICK_ON_PLACEHOLDER: "typingPlaceholder",
                        CLICK_ON_PLACEHOLDER_SMOKE: "typingPlaceholder.smoke",
                        CLICK_ON_PLACEHOLDER_MOLOTOV: "typingPlaceholder.molotov",
                        CLICK_ON_PLACEHOLDER_FLASH: "typingPlaceholder.flash",
                        CLICK_ON_PLACEHOLDER_HE: "typingPlaceholder.he",
                        EDIT_OLD: "editingOld"
                    },
                    entry: (context) => {
                        context.clickedPhIx = undefined
                    }
                },
                typingPlaceholder: {
                    id: "typingPlaceholder",
                    initial: "choosingType",
                    onDone: "#shadowmapOff",
                    entry: (context, event) => {
                        /* payload of send(), т.е. индекс(важно, не идентификатор) кликнутого placeholder 
                        присваивается в текущий_кликнутый_индекс */
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

const nadeTypeList = ["Smoke", "Molotov", "Flash", "He"]

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

        placeholders.value.push({
            idCrypto: crypto.randomUUID(),
            coords: {
                x: clickOnRect_xPercent,
                y: clickOnRect_yPercent
            },
            type: '',
        })
        // fetch("http://localhost:7351/smokes", {
        // 	body: JSON.stringify({somekey:'somevalue'}),
        // 	headers :{
        // 		"Content-Type": "application/json"
        // 	},
        // 	method: "post",
        // 	mode:"cors"
        // })
    }
}

function onClickPlaceholder(phIdCrypto: string) {
    /* Аргумент - placeholder.idCrypto(полученный из v-for="Placeholder in Placeholders") 
    Нажатия по этому споту - переход на выбор типа для этого спота*/

    // phIndex передаваемый в send почему-то подсвечивается белым а не оранж, хотя это 100% он.
    let phIndex = placeholders.value.findIndex((placeholder) => {
        return placeholder.idCrypto == phIdCrypto
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
        placeholders.value.findIndex((placeholderObj) => placeholderObj.idCrypto == rightClickedPlaceholder.idCrypto),
        1
    )
}
const smokeFormOn = computed(() => state.value.matches("shadowmapOn.typingPlaceholder.smoke"))
const molotovFormOn = computed(() => state.value.matches("shadowmapOn.typingPlaceholder.molotov"))
const flashFormOn = computed(() => state.value.matches("shadowmapOn.typingPlaceholder.flash"))
const heFormOn = computed(() => state.value.matches("shadowmapOn.typingPlaceholder.he"))
const formState = reactive({ smokeFormOn, molotovFormOn, flashFormOn, heFormOn })

const updateType = (newVal: string) => { placeholders.value[state.value.context.clickedPhIx!].type = newVal }
const updateName = (newVal: string) => { placeholders.value[state.value.context.clickedPhIx!].name = newVal }
const updateSide = (newVal: Side) => { placeholders.value[state.value.context.clickedPhIx!].side = newVal }
const updateTickrate = (newVal: Tickrate) => { placeholders.value[state.value.context.clickedPhIx!].tickrate = newVal }
const updateThrowClick = (newVal: ThrowClick) => { placeholders.value[state.value.context.clickedPhIx!].throwClick = newVal }
const updateThrowMovement = (newVal: ThrowMovement) => { placeholders.value[state.value.context.clickedPhIx!].throwMovement = newVal }
const updateDifficulty = (newVal: Difficulty) => { placeholders.value[state.value.context.clickedPhIx!].difficulty = newVal }

const updateIsOnewaySmoke = (newVal: boolean) => { placeholders.value[state.value.context.clickedPhIx!].isOnewaySmoke = newVal }
const updateIsFakeSmoke = (newVal: boolean) => { placeholders.value[state.value.context.clickedPhIx!].isFakeSmoke = newVal }
const updateIsBugSmoke = (newVal: boolean) => { placeholders.value[state.value.context.clickedPhIx!].isBugSmoke = newVal }
const updateForWhom = (newVal: ForWhom) => { placeholders.value[state.value.context.clickedPhIx!].forWhom = newVal }
const updateIsOnewayMolotov = (newVal: boolean) => { placeholders.value[state.value.context.clickedPhIx!].isOnewayMolotov = newVal }
const updateIsFakeMolotov = (newVal: boolean) => { placeholders.value[state.value.context.clickedPhIx!].isFakeMolotov = newVal }
const updateIsBugMolotov = (newVal: boolean) => { placeholders.value[state.value.context.clickedPhIx!].isBugMolotov = newVal }
const updateIsBugHe = (newVal: boolean) => { placeholders.value[state.value.context.clickedPhIx!].isBugHe = newVal }

onMounted(() => {
    window.onbeforeunload = (e) => {
        if (placeholders.value.length > 0) {
            e.preventDefault()
            return ''
        }
    }
})
onUnmounted(() => {
    window.onbeforeunload = null
})
</script>


<template>
    <div class="shadowMap" v-if="state.matches('shadowmapOn')"
        @mousedown="isDragging = false" @mousemove="isDragging = true"
        @mouseup.left="$event => pushNewPlaceholder($event)">

        <div class="placeholder" v-for="placeholder in placeholders" :style="{
            top: `${placeholder.coords.y}%`,
            left: `${placeholder.coords.x}%`,
            boxShadow: getShadowColor(placeholder.type),
            backgroundColor: getBgColor(placeholder.type)
        }" @click.left="onClickPlaceholder(placeholder.idCrypto)"
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
                        <img src="@/assets/icons/icon_smoke.webp"
                            alt="SmokeImg" style="max-height: 15px;">
                    </GS_Button>
                    <GS_Button @click="nadeTypeOnClick('Molotov')">
                        Molotov
                        <img src="@/assets/icons/icon_molotov.webp"
                            alt="MolotovImg"
                            style="max-height: 15px; scale: 1.5;">
                    </GS_Button>
                    <GS_Button @click="nadeTypeOnClick('Flash')">
                        Flash
                        <img src="@/assets/icons/icon_flash.webp"
                            alt="FlashImg" style="max-height: 15px;">
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

        <!-- Формы для вписывания данных новой гранаты -->
        <AddGrenadeForm @exit="send('COLLAPSE')" v-bind="formState"
            v-if="smokeFormOn || molotovFormOn || flashFormOn || heFormOn"
            :clickedPlaceholder="placeholders[state.context.clickedPhIx!]"
            :clickedPhIx="state.context.clickedPhIx"
            @update:typeValue="updateType" @update:nameValue="updateName"
            @update:throwSpotsIdsValue="(newVal: any) => { }"
            @update:sideValue="updateSide"
            @update:tickrateValue="updateTickrate"
            @update:comboIdsValue="(newVal: any) => { }"
            @update:throwClickValue="updateThrowClick"
            @update:throwMovementValue="updateThrowMovement"
            @update:difficultyValue="updateDifficulty"
            @update:isOnewaySmokeValue="updateIsOnewaySmoke"
            @update:isFakeSmokeValue="updateIsFakeSmoke"
            @update:isBugSmokeValue="updateIsBugSmoke"
            @update:forWhomValue="updateForWhom"
            @update:isOnewayMolotovValue="updateIsOnewayMolotov"
            @update:isFakeMolotovValue="updateIsFakeMolotov"
            @update:isBugMolotovValue="updateIsBugMolotov"
            @update:isBugHeValue="updateIsBugHe" />
    </div>

    <!-- вкл/выкл CMS; вне div, т.к. отвечает за его отображение -->
    <Teleport to="body">
        <div class="toggleCMSbtn" :style="{ backgroundColor: buttonBgColor }"
            @click="send('TOGGLE')">
            {{ buttonContent }}
        </div>
    </Teleport>
</template>


<style scoped lang="scss">
.toggleCMSbtn {
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
    box-shadow: 0 0 500px -10px rgba(255, 226, 147, 0.25), 0 0 21px 7px rgba(3, 14, 53, 0.26);
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