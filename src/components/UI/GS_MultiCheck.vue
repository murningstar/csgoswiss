<script setup lang="ts">
import type { Grenade } from '@/data/interfaces/Grenade';
import type { Difficulty } from '@/data/types/GrenadeProperties';
import { computed, reactive, watch } from 'vue';
import { gsap } from "gsap"

const props = defineProps<{
    options: Grenade['difficulty'][],
    state: {}
    // state - объект из boolean флажков.
    // options - опции, соответствующие этим флажкам.
}>()
const emit = defineEmits(['update:modelValue'])
function onChange(event: Event, option: Difficulty) {
    emit('update:modelValue', (event.target as HTMLInputElement).checked, option)
    // console.log((event.target as HTMLInputElement).checked, option);
}

const warningActive = computed(() => {
    for (let flagName in props.state) {
        if (props.state[flagName as keyof typeof props.state] === true) {
            // console.log(flagName);
            return false
        }
    }
    return true
})
const unTogglabelOption = computed(() => {
    let trueArr = []
    let trueCounter = 0
    for (let flagName in props.state) {
        if (props.state[flagName as keyof typeof props.state] === true) {
            trueCounter++
            trueArr.push(flagName)
        }
    }
    if (trueCounter === 1) {
        return trueArr[0]
    }
    else {
        return null
    }
})

function unTogglabelEffect(event: Event, option: Difficulty) {
    if (unTogglabelOption.value?.includes(option) &&
        (
            (event.target as HTMLDivElement).className == 'inputWrapper' ||
            (event.target as HTMLDivElement).className == 'labelWrapper'
        )
    ) {
        const parent = (event.target as HTMLDivElement).parentElement
        gsap.to(parent, {
            backgroundColor: "#ca202668",
            duration: 0.09,
            onComplete: () => {
                gsap.to(parent, {
                    backgroundColor: "transparent",
                    duration: 0.09,
                })
            }
        }
        )
    }
}
</script>

<template>
    <div class="multicheck" :class="{ warnbg: warningActive }">
        <div class="multicheck__option" v-for="option in options"
            @click="unTogglabelEffect($event, option)">
            <div class="inputWrapper">
                <input type="checkbox" :id="option"
                    :checked="props.state[`${option}Visible` as keyof typeof state]"
                    @change="onChange($event, option)" :class="{
                        warninput: warningActive,
                        untogglabel: `${option}Visible` === unTogglabelOption
                    }">
            </div>
            <div class="labelWrapper">
                <label :for="option"
                    :class="{ untogglabel: `${option}Visible` === unTogglabelOption }">
                    {{ option }}
                </label>
            </div>
        </div>
        <!-- <svg v-show="warningActive" class="exclamation-red" fill="#000000" -->
        <!-- height="800px" width="800px" id="Layer_1" data-name="Layer 1" -->
        <!-- xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"> -->
        <!-- <path fill="red" class="cls-1" -->
        <!-- d="M6.37119,11.87271h3.2554V14H6.37119ZM6.31551,2l.37063,8.54245H9.31386L9.68449,2Z" /> -->
        <!-- </svg> -->
        <!-- <Teleport to="body"> -->
        <!-- <div class="warn-global" v-show="warningActive"> -->
        <!-- <svg class="exclamation-yellow" fill="#000000" height="800px" -->
        <!-- width="800px" id="Layer_1" data-name="Layer 1" -->
        <!-- xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"> -->
        <!-- <path fill="red" class="cls-2" -->
        <!-- d="M6.37119,11.87271h3.2554V14H6.37119ZM6.31551,2l.37063,8.54245H9.31386L9.68449,2Z" /> -->
        <!-- </svg> -->
        <!-- <div class="warn-global__message"> -->
        <!-- You deselected filter -->
        <!-- </div> -->
        <!-- </div> -->
        <!-- </Teleport> -->
    </div>
</template>

<style scoped lang="scss">
.multicheck {
    @include gs-bd-clicked;
    padding: 2px 0;
    width: 8rem;
    background-color: $bg_light;

    &__option {
        display: flex;
        align-items: center;
        padding-left: 0.5rem;
    }
}

.inputWrapper {
    display: inline-block;
    cursor: pointer;
    border-radius: 5px;
}

input {
    appearance: none;
    display: block;
    cursor: pointer;
    height: 0.9375rem;
    width: 0.9375rem;
    border-radius: 3px;
    border: 1px solid #70685f;


    &:checked {
        background-color: $text_active;
        border: 2px solid #70685f;
        background-image: url('@/assets/ui/ui_checked.webp');
        background-position: center;
        background-repeat: no-repeat;
        background-size: contain;

        &+label {
            color: white;
        }
    }

    &:hover {
        cursor: pointer;

        &+label {
            color: white;
        }
    }

}

label {

    display: flex;
    align-items: center;
    text-transform: capitalize;

    &:hover {
        cursor: pointer;
    }

}

.labelWrapper {
    margin-left: 0.625rem;
    display: inline-block;
    cursor: pointer;
}


.untogglabel {
    pointer-events: none;
}

.warninput {
    border: 1px solid $text_disabled;
}

.warnbg {
    background-color: #ca202668;
}

// .exclamation-red {
//     width: 1.7rem;
//     height: 1.7rem;
//     position: absolute;
//     top: 0.2rem;
//     right: 0.2rem;
//     padding: 0.2rem;
//     border: 2px solid red;
//     background-color: rgba(188, 34, 42, 0.5);
// }

// .exclamation-yellow {}

// .cls-2 {
//     fill: rgb(255, 234, 0);
//     pointer-events: none;
// }

// .warn-global {
//     width: 200px;
//     position: fixed;
//     top: 50%;
//     left: 50%;
//     transform: translate(-50%, -50%);

//     svg {
//         width: 100%;
//         height: auto;
//         position: relative;
//         background-color: rgba(188, 170, 34, 0.5);
//         border: 10px solid rgb(255, 225, 0);
//     }

//     &__message {
//         margin-top: 0.3rem;
//         position: relative;
//         text-align: center;
//         color: rgb(255, 236, 114);
//         background-color: rgba(114, 104, 26, 0.597);
//         border: 5px solid rgb(255, 225, 0);
//         width: 100%;
//         padding: 0.5rem;
//     }
// }
</style>