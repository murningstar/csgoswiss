<script setup lang="ts">
/* Libs */
/* vue */
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router';
/* components */
import GS_Window from '@/components/UI/GS_Window.vue';
import GS_ContainerLight from '@/components/UI/GS_ContainerLight.vue';
import GS_Input from '@/components/UI/GS_Input.vue'
import GS_Button from '@/components/UI/GS_Button.vue';
import GS_Select from '@/components/UI/GS_Select.vue'
import GS_Radio from '@/components/UI/GS_Radio.vue'
import GS_Check from '@/components/UI/GS_Check.vue'
/* types */
import type { Spot } from '@/data/v2_spotSvyaz/Spot';
import type { NadeType, Side, Tickrate, ThrowClick, ThrowMovement, Difficulty, ForWhom } from '@/data/types/GrenadeProperties';
import { nanoid } from 'nanoid';
import type { Lineup } from '@/data/v2_spotSvyaz/Lineup';
/* zod schema */
import { lineupSchema } from "@/data/zodSchemas/lineupSchema"
import axios from 'axios';
type newLineupDataType = {
    toSpot: Spot | null,
    fromSpot: Spot | null,
}
const props = defineProps<{
    isVisible: boolean,
    newLineupData: newLineupDataType,
}>()
const emit = defineEmits(['exit'])
const route = useRoute()
const currentRoute = computed(() => route.path.slice(1))
const data = reactive({
    lineupId: nanoid(13) as Lineup['lineupId'],
    imgFileAim: null as File | null,
    imgFileAimZoom: null as File | null,
    imgFileOverview: null as File | null,
    /* Потом буду еще категоризировать эти imgFile, 
    т.к. буду добавлять либо гифки либо вставки видео из ютуба
    и => изменю сам type Lineup */
    nadeType: 'smoke' as NadeType,
    side: 't' as Side,
    tickrate: 128 as Tickrate,
    comboLineupIds: [],
    throwClick: 'leftclick' as ThrowClick,
    throwMovement: 'regular' as ThrowMovement,
    difficulty: 'easy' as Difficulty,
    forWhom: undefined as ForWhom | undefined,
})
const computeds = {
    name: computed(() => `${props.newLineupData.fromSpot!.name} -> ${props.newLineupData.toSpot!.name}`),
    fileName: computed(() => {
        const into = props.newLineupData.toSpot!.name
        const from = props.newLineupData.fromSpot!.name
        return `into-${methods.toCamelCase(into)}-from-${methods.toCamelCase(from)}`
    })
}
const methods = {
    toCamelCase(string: string) {
        const wordsArr = string.split(' ')
        return wordsArr.map((word, ix) => {
            if (ix > 0) {
                const firstChar = word.charAt(0)
                const restChars = word.substring(1)
                return firstChar.toUpperCase() + restChars
            }
            else return word
        }).join('')
    }
}
const handlers = {
    click: {
        exit: () => emit('exit'),
        submit: async () => {
            if (!data.imgFileAim && !data.imgFileAimZoom && !data.imgFileOverview) {
                return alert('Нужно залить минимум одну из картинок')
            }
            const lineup: Omit<(Lineup & {
                imgFileAim: File | null,
                imgFileAimZoom: File | null,
                imgFileOverview: File | null
            }), 'imgSrcAim' | 'imgSrcAimZoom' | 'imgSrcOverview'> = {
                lineupId: data.lineupId,
                toId: props.newLineupData.toSpot!.spotId,
                fromId: props.newLineupData.fromSpot!.spotId,
                imgFileAim: data.imgFileAim,
                imgFileAimZoom: data.imgFileAimZoom,
                imgFileOverview: data.imgFileOverview,
                nadeType: data.nadeType,
                side: data.side,
                tickrate: data.tickrate,
                comboLineupIds: data.comboLineupIds,
                throwClick: data.throwClick,
                throwMovement: data.throwMovement,
                difficulty: data.difficulty,
                forWhom: data.forWhom,
            }
            const result = lineupSchema.safeParse(lineup)
            if (!result.success) {
                return alert('Заполненные данные невалидны. Подробности: ' + result.error)
            } else {
                const formData = new FormData()
                formData.append('lineupId', lineup['lineupId'])
                formData.append('toId', lineup['toId'])
                formData.append('fromId', lineup['fromId'])
                if (lineup.imgFileAim) {
                    formData.append('imgFileAim', lineup['imgFileAim'])
                }
                if (lineup.imgFileAimZoom) {
                    formData.append('imgFileAimZoom', lineup['imgFileAimZoom'])
                }
                if (lineup.imgFileOverview) {
                    formData.append('imgFileOverview', lineup['imgFileOverview'])
                }
                formData.append('nadeType', lineup['nadeType'])
                formData.append('side', lineup['side'])
                formData.append('tickrate', JSON.stringify(lineup['tickrate']))
                formData.append('comboLineupIds', JSON.stringify(lineup['comboLineupIds']))
                formData.append('throwClick', lineup['throwClick'])
                formData.append('throwMovement', lineup['throwMovement'])
                formData.append('difficulty', lineup['difficulty'])
                if (lineup.forWhom) {
                    formData.append('forWhom', lineup['forWhom'])
                }
                formData.append('name', computeds.name.value) //
                formData.append('lineupFileName', computeds.fileName.value) //
                const response = await axios.postForm(`http://localhost:7351/lineups/${currentRoute.value}`, formData)
                if (response.status !== 200) {
                    alert('Server response != 200')
                    console.log(response);
                }
                else setTimeout(window.location.reload, 100);
            }

        }
    },
    updateModel: {
        nadeType: (nv: NadeType) => data.nadeType = nv,
        side: (nv: Side) => data.side = nv,
        tickrate: (nv: Tickrate) => data.tickrate = nv,
        throwClick: (nv: ThrowClick) => data.throwClick = nv,
        throwMovement: (nv: ThrowMovement) => data.throwMovement = nv,
        difficulty: (nv: Difficulty) => data.difficulty = nv,
        forWhom: (nv: ForWhom) => data.forWhom = nv,
    },
    fileChanges: {
        onchange: (e: Event, type: 'aim' | 'aimZoom' | 'overview') => {
            const target = e.target as HTMLInputElement
            const files = target.files
            if (!files) { // если пользователь отменил добавление картинки
                if (type == 'aim') { data.imgFileAim = null }
                if (type == 'aimZoom') { data.imgFileAimZoom = null }
                if (type == 'overview') { data.imgFileOverview = null }
                return
            }
            if (files) { // если добавлена картинка
                if (type == 'aim') { data.imgFileAim = target.files![0] }
                if (type == 'aimZoom') { data.imgFileAimZoom = target.files![0] }
                if (type == 'overview') { data.imgFileOverview = target.files![0] }
                return
            }
        }
    }
}

</script>

<template>
    <Teleport to="body">
        <GS_Window v-if="isVisible" @exit="handlers.click.exit">
            <template #title> Create Lineup </template>
            <template #default>
                <GS_ContainerLight>

                    <!-- lineupId -->
                    <div class="inputItem">
                        <div class="inputItem__label generated">
                            lineupId: {{ data.lineupId }}
                        </div>
                    </div>

                    <!-- toId -->
                    <div class="inputItem">
                        <div class="inputItem__label generated">
                            toId: {{ props.newLineupData.toSpot?.spotId }}
                        </div>
                    </div>

                    <!-- fromId -->
                    <div class="inputItem">
                        <div class="inputItem__label generated">
                            fromId: {{ props.newLineupData.fromSpot?.spotId }}
                        </div>
                    </div>

                    <!-- name -->
                    <div class="inputItem">
                        <div class="inputItem__label generated">
                            name: {{ computeds.name.value }}
                        </div>
                    </div>

                    <!-- nadeType -->
                    <div class="inputItem">
                        <GS_Select :options="['smoke', 'molotov', 'flash', 'he']"
                            :selected="data.nadeType"
                            @update:modelValue="handlers.updateModel.nadeType" />
                        <div class="inputItem__label">NadeType</div>
                    </div>

                    <!-- imgFileAim -->
                    <div class="inputItem">
                        <div class="inputItem__label">imgFileAim</div>
                        <input type="file" name="fromImgFile" id=""
                            accept="image/*,.png,.jpg,.jpeg,.webp"
                            @change="$event => handlers.fileChanges.onchange($event, 'aim')"
                            style="display: block;">
                    </div>
                    <!-- imgFileAimZoom -->
                    <div class="inputItem">
                        <div class="inputItem__label">imgFileAimZoom</div>
                        <input type="file" name="fromImgFile" id=""
                            accept="image/*,.png,.jpg,.jpeg,.webp"
                            @change="$event => handlers.fileChanges.onchange($event, 'aimZoom')"
                            style="display: block;">
                    </div>
                    <!-- imgFileOverview -->
                    <div class="inputItem">
                        <div class="inputItem__label">imgFileOverview</div>
                        <input type="file" name="fromImgFile" id=""
                            accept="image/*,.png,.jpg,.jpeg,.webp"
                            @change="$event => handlers.fileChanges.onchange($event, 'overview')"
                            style="display: block;">
                    </div>

                    <!-- side -->
                    <div class="inputItem">
                        <GS_Radio :options="['ct', 't']" :modelValue="data.side"
                            :radioName="'sideRadio'"
                            @update:modelValue="handlers.updateModel.side" />
                        <div class="inputItem__label">Side</div>
                    </div>

                    <!-- tickrate -->
                    <div class="inputItem">
                        <GS_Radio :options="[64, 128]" :modelValue="data.tickrate"
                            :radioName="'tickrateRadio'"
                            @update:modelValue="handlers.updateModel.tickrate" />
                        <div class="inputItem__label">Tickrate</div>
                    </div>

                    <!-- comboLineupIds -->
                    <div class="inputItem">
                        ---
                        <div class="inputItem__label">ComboLineupIds</div>
                    </div>

                    <!-- throwClick -->
                    <div class="inputItem">
                        <GS_Select
                            :options="['leftclick', 'rightclick', 'doubleclick']"
                            :selected="data.throwClick"
                            @update:modelValue="handlers.updateModel.throwClick" />
                        <div class="inputItem__label">ThrowClick</div>
                    </div>

                    <!-- throwMovement -->
                    <div class="inputItem">
                        <GS_Select
                            :options='["regular", "jumpthrow", "runthrow", "onTheFeel"]'
                            :selected="data.throwMovement"
                            @update:modelValue="handlers.updateModel.throwMovement" />
                        <div class="inputItem__label">ThrowMovement</div>
                    </div>

                    <!-- Difficulty -->
                    <div class="inputItem">
                        <GS_Select
                            :options='["easy", "medium", "hard", "pixelPerfect"]'
                            :selected="data.difficulty"
                            @update:modelValue="handlers.updateModel.difficulty" />
                        <div class="inputItem__label">Difficulty</div>
                    </div>

                    <!-- ForWhom Flash -->
                    <div v-if="data.nadeType == 'flash'" class="inputItem">
                        <GS_Radio :options='["yourself", "teammate"]'
                            :modelValue="data.forWhom" :radioName="'forWhomRadio'"
                            @update:modelValue="handlers.updateModel.difficulty" />
                        <div class="inputItem__label">Flash for whom?</div>
                    </div>

                    <!--Buttons SUMBIT/EXIT -->
                    <div style="display: flex; margin-top: 2rem;">
                        <GS_Button @click="handlers.click.submit">
                            Submit
                        </GS_Button>
                        <GS_Button @click="handlers.click.exit">
                            Exit(and delete)
                        </GS_Button>
                    </div>
                </GS_ContainerLight>
            </template>
        </GS_Window>
    </Teleport>
</template>

<style scoped lang="scss">
.inputItem {
    display: flex;
}

.generated {
    color: grey;
}

.italic {
    font-style: italic;
}
</style>