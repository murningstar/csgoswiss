<script setup lang="ts">
const props = defineProps<{ modelValue: string|undefined }>()
const emit = defineEmits(['update:modelValue'])
const modelHandler = (event:Event)=>{
    emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>
        
<template>
    <input type="text" :value="props.modelValue" @input="modelHandler">
</template>

<style scoped lang="scss">
    input{
        font-size: 1rem;
        height: 1.8rem;
        padding-left: 3px;
        width: 7.5rem;
        background-color: $bg_dark;
        color: var(--text_regular);
        @include gs-bd-clicked;
    }
    input:focus{
        outline: none;
    }
</style>