<script setup lang="ts">
/* КОМПОНЕНТ В КАЧЕСТВЕ MODELVALUE ПРИНИМАЕТ ЗНАЧЕНИЕ ИЗ OPTIONS
НЕСМОТРЯ НА ТО ЧТО У INPUT:RANGE VALUE ВСЕГДА СТРОКА С ЧИСЛОМ.
ПОДСТАНОВКА НУЖНОГО VALUE ПО MODELVALUE ДЕЛАЕТСЯ ПОД КАПОТОМ
(В ЛОГИКЕ ЭТОГО КОМПОНЕНТА) */
import { computed } from 'vue';

const props = defineProps<{
    modelValue: string,
    options: string[],
}>()
const emit = defineEmits(['update:modelValue'])
function onChange(event: Event) {
    const valueStr = (event.target as HTMLInputElement).value
    const value = Number(valueStr)
    emit('update:modelValue', props.options[value])
}
const inputValue = computed(() => {
    // console.log('indexof: '+props.options.indexOf(props.modelValue).toString());
    return props.options.indexOf(props.modelValue).toString()
})
</script>

<template>
    <div class="switch">
        <div class="inputWrapper">
            <input type="range" name="" id="" min="0" :max="options.length - 1"
                step="1" @change="onChange" :value="inputValue">
            <!-- value у input-range это всегда строка с числом -->
            <div class="fakeTrack"></div>
            <!-- fakeTrack нужен, чтобы сделать толстый инпут(без фона), -->
            <!-- чтобы слегка вне него можно было кликать для передвижения ползунка -->
        </div>
        <div class="lines">
            <div class="line" v-for="line in props.options"
                :class="{ yellow: line === modelValue }">|</div>
        </div>
        <div class="labels">
            <div class="label" v-for="option in options"
                :class="{ active: option === modelValue }">{{ option }}</div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.switch {
    width: 100%;
    display: flex;
    padding: 0.5rem 0.5rem 0.5rem 0.9rem;
    @include gs-bd-clicked;
    background-color: $bg_light;
    position: relative;
}

.inputWrapper {
    // background-color: 1px solid red;
    // border: 1px solid red;
    position: absolute;
    height: 1rem;    
    top: 50%;
    left: 1rem;
    transform: translate(-50%, -50%) rotate(90deg);
}

.fakeTrack {
    position: absolute;
    height: 0.25rem;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
    z-index: 0;
    background-color: #1f1f1f;
    @include gs-bd-clicked;
}

input {
    // padding: 0.6rem;
    position: relative;
    top: 50%;
    transform: translateY(-50%);
    width: 3.5rem;
    z-index: 1;
    display: block;
    appearance: none;
    background: none;
    height: 1.6rem;
    cursor: pointer;
}

input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    cursor: pointer;
    color: transparent;
    @include gs-bd;
    background-color: $bg_light;
    height: 1rem;
    width: 0.5rem;
    border-radius: 0px;
    /* You need to specify a margin in Chrome, but in Firefox and IE it is automatic */
    /* Add cool effects to your sliders! */
}

/* All the same stuff for Firefox */
input[type=range]::-moz-range-thumb {
    color: transparent;
    @include gs-bd;
    background-color: $bg_light;
    height: 1rem;
    width: 0.5rem;
    border-radius: 0px;
    cursor: pointer;
}

.lines {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin: 0.7rem 2rem 0.7rem 0;
    font-size: 0.4rem;
    color: $text_disabled;
}

.line {
    writing-mode: vertical-lr;
}

.labels {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
}

.label {}

.active {
    color: $text_active;
}
.yellow {
    color: rgb(223, 202, 63);
}
</style>