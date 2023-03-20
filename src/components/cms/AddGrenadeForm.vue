<template>
    <div>
        <Teleport to="body">
            <GS_Window @exit="$emit('exit')">
                <template #title>
                    Enter new grenade's data
                </template>
                <GS_ContainerLight>
                    <form action="" enctype="">
                        <div class="generated">
                            <!-- id -->
                            <div class="formItem">
                                <div class="formItem__label">
                                    ID
                                </div>
                                <div class="formItem__content disabled">
                                    {{ clickedPlaceholder?.id }}
                                </div>
                            </div>
                            <!-- coords -->
                            <div class="formItem">
                                <div class="formItem__label">
                                    Coords
                                </div>
                                <div class="formItem__content coords disabled">
                                    <div class="x">{{ `X: ${x}` }}</div>
                                    <div class="y">{{ `Y: ${y}` }}</div>
                                </div>
                            </div>
                        </div>

                        <div class="inputed">
                            <!-- type -->
                            <div class="formItem">
                                <div class="formItem__content">
                                    <GS_Select
                                        :options="['Smoke', 'Molotov', 'Flash', 'He']"
                                        :selected="clickedPlaceholder?.type"
                                        @update:modelValue="updateType" />
                                </div>
                                <div class="formItem__label">
                                    Type
                                </div>
                            </div>
                            <!-- name -->
                            <div class="formItem">
                                <GS_Input :modelValue="formData.name"
                                    @update:modelValue="updateName"
                                    style="width: 100%;" />
                                <div class="formItem__label">
                                    Name
                                </div>
                            </div>
                            <!-- throwSpotIds -->
                            <div class="formItem">
                                <div class="formItem__content">---</div>
                                <div class="formItem__label">
                                    Throw spots
                                </div>
                            </div>
                            <!-- side -->
                            <div class="formItem">
                                <div class="formItem__content">
                                    <GS_Radio :options="['ct', 't']"
                                        :modelValue="clickedPlaceholder?.side"
                                        :radioName="'sideRadio'"
                                        @update:modelValue="updateSide" />
                                </div>
                                <div class="formItem__label">
                                    Side
                                </div>
                            </div>
                            <!-- tickrate -->
                            <div class="formItem">
                                <div class="formItem__content">
                                    <GS_Radio :options="[64, 128]"
                                        :modelValue="clickedPlaceholder?.tickrate"
                                        :radioName="'tickrateRadio'"
                                        @update:modelValue="updateTickrate" />
                                </div>
                                <div class="formItem__label">
                                    Tickrate
                                </div>
                            </div>
                            <!-- comboIds -->
                            <div class="formItem">
                                <div class="formItem__content">---</div>
                                <div class="formItem__label">
                                    Combo grenade's Ids
                                </div>
                            </div>
                            <!-- throwClick -->
                            <div class="formItem">
                                <div class="formItem__content">
                                    <GS_Select
                                        :options="['leftclick', 'rightclick', 'doubleclick']"
                                        :selected="clickedPlaceholder?.throwClick || ''"
                                        @update:modelValue="updateThrowClick" />
                                </div>
                                <div class="formItem__label">
                                    Throw click
                                </div>
                            </div>
                            <!-- throwMovement -->
                            <div class="formItem">
                                <div class="formItem__content">
                                    <GS_Select
                                        :options='["regular", "jumpthrow", "runthrow", "onTheFeel"]'
                                        :selected="clickedPlaceholder?.throwMovement || ''"
                                        @update:modelValue="updateThrowMovement" />
                                </div>
                                <div class="formItem__label">
                                    Throw movement
                                </div>
                            </div>
                            <!-- difficulty -->
                            <div class="formItem">
                                <div class="formItem__content">
                                    <GS_Select
                                        :options='["easy", "normal", "medium", "hard", "pixelPerfect"]'
                                        :selected="clickedPlaceholder?.difficulty || ''"
                                        @update:modelValue="updateDifficulty" />
                                </div>
                                <div class="formItem__label">
                                    Difficulty
                                </div>
                            </div>
                            <!-- isOnewaySmoke -->
                            <div class="formItem"
                                v-if="clickedPlaceholder?.type == 'Smoke'">
                                <div class="formItem__content">
                                    <GS_Check
                                        :modelValue="clickedPlaceholder?.isOnewaySmoke"
                                        @update:modelValue="updateIsOnewaySmoke"
                                        :checkId="'isOnewaySmoke'">
                                        Oneway smoke?
                                        <img class="smokeImg"
                                            src="@/assets/icons/icon_smoke.webp"
                                            alt="">
                                    </GS_Check>
                                </div>
                            </div>
                            <!-- isFakeSmoke -->
                            <div class="formItem"
                                v-if="clickedPlaceholder?.type == 'Smoke'">
                                <div class="formItem__content">
                                    <GS_Check
                                        :modelValue="clickedPlaceholder?.isFakeSmoke"
                                        @update:modelValue="updateIsFakeSmoke"
                                        :checkId="'isFakeSmoke'">
                                        Fake smoke?
                                        <img class="smokeImg"
                                            src="@/assets/icons/icon_smoke.webp"
                                            alt="">
                                    </GS_Check>
                                </div>
                            </div>
                            <!-- isBugSmoke -->
                            <div class="formItem"
                                v-if="clickedPlaceholder?.type == 'Smoke'">
                                <div class="formItem__content">
                                    <GS_Check
                                        :modelValue="clickedPlaceholder?.isBugSmoke"
                                        @update:modelValue="updateIsBugSmoke"
                                        :checkId="'isBugSmoke'">
                                        Bug smoke?
                                        <img class="smokeImg"
                                            src="@/assets/icons/icon_smoke.webp"
                                            alt="">
                                    </GS_Check>
                                </div>
                            </div>
                            <!-- forWhom -->
                            <div class="formItem"
                                v-if="clickedPlaceholder?.type == 'Flash'">
                                <div class="formItem__content">
                                    <GS_Radio
                                        :options='["yourself", "teammate"]'
                                        :modelValue="clickedPlaceholder?.forWhom"
                                        :radioName="'forWhomRadio'"
                                        @update:modelValue="updateForWhom" />
                                </div>
                                <div class="formItem__label">
                                    For whom?
                                    <img src="@/assets/icons/icon_flash.webp"
                                        alt="">
                                </div>
                            </div>
                            <!-- isOnewayMolotov -->
                            <div class="formItem"
                                v-if="clickedPlaceholder?.type == 'Molotov'">
                                <div class="formItem__content">
                                    <GS_Check
                                        :modelValue="clickedPlaceholder?.isOnewayMolotov"
                                        @update:modelValue="updateIsOnewayMolotov"
                                        :checkId="'isOnewayMolotov'">
                                        Oneway molotov?
                                        <img class="molotovImg"
                                            src="@/assets/icons/icon_molotov.webp"
                                            alt="">
                                    </GS_Check>
                                </div>
                            </div>
                            <!-- isFakeMolotov -->
                            <div class="formItem"
                                v-if="clickedPlaceholder?.type == 'Molotov'">
                                <div class="formItem__content">
                                    <GS_Check
                                        :modelValue="clickedPlaceholder?.isFakeMolotov"
                                        @update:modelValue="updateIsFakeMolotov"
                                        :checkId="'isFakeMolotov'">
                                        Fake molotov?
                                        <img class="molotovImg"
                                            src="@/assets/icons/icon_molotov.webp"
                                            alt="">
                                    </GS_Check>
                                </div>
                            </div>
                            <!-- isBugMolotov -->
                            <div class="formItem"
                                v-if="clickedPlaceholder?.type == 'Molotov'">
                                <div class="formItem__content">
                                    <GS_Check
                                        :modelValue="clickedPlaceholder?.isBugMolotov"
                                        @update:modelValue="updateIsBugMolotov"
                                        :checkId="'isBugMolotov'">
                                        Bug molotov?
                                        <img class="molotovImg"
                                            src="@/assets/icons/icon_molotov.webp"
                                            alt="">
                                    </GS_Check>
                                </div>
                            </div>
                            <!-- isBugHe -->
                            <div class="formItem"
                                v-if="clickedPlaceholder?.type == 'He'">
                                <div class="formItem__content">
                                    <GS_Check
                                        :modelValue="clickedPlaceholder?.isBugHe"
                                        @update:modelValue="updateIsBugHe"
                                        :checkId="'isBugHe'">
                                        Bug He?
                                        <img class="heImg"
                                            src="@/assets/icons/icon_he.webp"
                                            alt="">
                                    </GS_Check>
                                </div>
                            </div>
                        </div>
                    </form>
                </GS_ContainerLight>
            </GS_Window>
        </Teleport>
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import type { Placeholder } from '@/data/interfaces/Placeholder'
import GS_ContainerLight from "@/components/UI/GS_ContainerLight.vue"
import GS_Window from "@/components/UI/GS_Window.vue"
import GS_Input from "@/components/UI/GS_Input.vue"
import GS_Select from "@/components/UI/GS_Select.vue"
import GS_Radio from "@/components/UI/GS_Radio.vue"
import GS_Check from "@/components/UI/GS_Check.vue"
import type { Difficulty, ForWhom, Side, ThrowClick, ThrowMovement, Tickrate } from '@/data/types/GrenadeProperties';
import { z } from 'zod'
export default {
    __name: "AddGrenadeForm",
    name: "AddGrenadeForm",
    components: {
        GS_ContainerLight,
        GS_Window,
        GS_Input,
        GS_Select,
        GS_Radio,
        GS_Check
    },
    emits: [
        'exit',
        'update:typeValue',
        'update:nameValue',
        // throwspotIds
        'update:sideValue',
        'update:tickrateValue',
        // comboIds
        'update:throwClickValue',
        'update:throwMovementValue',
        'update:difficultyValue',

        'update:isOnewaySmokeValue',
        'update:isFakeSmokeValue',
        'update:isBugSmokeValue',
        'update:forWhomValue',
        'update:isOnewayMolotovValue',
        'update:isFakeMolotovValue',
        'update:isBugMolotovValue',
        'update:isBugHeValue',
    ],
    props: {
        smokeFormOn: Boolean,
        molotovFormOn: Boolean,
        flashFormOn: Boolean,
        heFormOn: Boolean,
        clickedPlaceholder: { type: Object as PropType<Placeholder> },
        clickedPhIx: Number,
    },
    data(): { formData: Placeholder } {
        return {
            formData: {
                id: this.clickedPlaceholder!.id,
                coords: this.clickedPlaceholder!.coords,
                type: this.clickedPlaceholder!.type,
                name: this.clickedPlaceholder?.name,
                throwSpotsIds: this.clickedPlaceholder?.throwSpotsIds,
                side: this.clickedPlaceholder?.side,
                tickrate: this.clickedPlaceholder?.tickrate,
                comboIds: this.clickedPlaceholder?.comboIds,
                throwClick: this.clickedPlaceholder?.throwClick,
                throwMovement: this.clickedPlaceholder?.throwMovement,
                difficulty: this.clickedPlaceholder?.difficulty,

                isOnewaySmoke: this.clickedPlaceholder?.isOnewaySmoke,
                isFakeSmoke: this.clickedPlaceholder?.isFakeSmoke,
                isBugSmoke: this.clickedPlaceholder?.isBugSmoke,
                forWhom: this.clickedPlaceholder?.forWhom,
                isOnewayMolotov: this.clickedPlaceholder?.isOnewayMolotov,
                isFakeMolotov: this.clickedPlaceholder?.isFakeMolotov,
                isBugMolotov: this.clickedPlaceholder?.isBugMolotov,
                isBugHe: this.clickedPlaceholder?.isBugHe,
            }
        }
    },
    methods: {
        updateType(newVal: string) { this.$emit('update:typeValue', newVal) },
        updateName(newVal: string) { this.$emit('update:nameValue', newVal) },
        // ThrowSpots
        updateSide(newVal: Side) { this.$emit('update:sideValue', newVal) },
        updateTickrate(newVal: Tickrate) { this.$emit('update:tickrateValue', newVal) },
        // Combo
        updateThrowClick(newVal: ThrowClick) { this.$emit('update:throwClickValue', newVal) },
        updateThrowMovement(newVal: ThrowMovement) { this.$emit('update:throwMovementValue', newVal) },
        updateDifficulty(newVal: Difficulty) { this.$emit('update:difficultyValue', newVal) },

        updateIsOnewaySmoke(newVal: boolean) { this.$emit('update:isOnewaySmokeValue', newVal) },
        updateIsFakeSmoke(newVal: boolean) { this.$emit('update:isFakeSmokeValue', newVal) },
        updateIsBugSmoke(newVal: boolean) { this.$emit('update:isBugSmokeValue', newVal) },
        updateForWhom(newVal: ForWhom) { this.$emit('update:forWhomValue', newVal) },
        updateIsOnewayMolotov(newVal: boolean) { this.$emit('update:isOnewayMolotovValue', newVal) },
        updateIsFakeMolotov(newVal: boolean) { this.$emit('update:isFakeMolotovValue', newVal) },
        updateIsBugMolotov(newVal: boolean) { this.$emit('update:isBugMolotovValue', newVal) },
        updateIsBugHe(newVal: boolean) { this.$emit('update:isBugHeValue', newVal) },
    },
    computed: {
        x() { return `${this.clickedPlaceholder?.coords.x.toFixed(2)}%` },
        y() { return `${this.clickedPlaceholder?.coords.y.toFixed(2)}%` },
    },
}
</script>

<style lang="scss" scoped>
form {
    .generated {
        .formItem {
            justify-content: space-between;

        }

        margin-bottom: 2rem;
    }

    .inputed {
        .formItem {

            &__label {
                margin-left: 0.625rem;
            }
        }
    }

    .formItem {
        display: flex;
        width: 100%;
        margin-bottom: 0.75rem;

        &__content {
            display: flex;
            align-items: center;
        }

        &:last-child {
            margin-bottom: none;
        }
    }
}

.coords {
    @include gs-bd-clicked;
    display: flex;
    justify-content: center;
    background-color: $bg_dark;
    padding: 0 0.5rem 0 0.5rem;
    margin-left: 1rem;
    width: 100%;
    cursor: pointer;

    .x {
        margin-right: 1rem;
    }
}

.disabled {
    color: var(--text_disabled);
}

.active {
    color: var(--text_active);
}

img {
    position: relative;
    margin: 0 0.3rem;
    height: 1rem;
}

.molotovImg {
    height: 1.6rem;
}
</style>