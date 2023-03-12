<script setup lang="ts">
const props = defineProps<{ options: string[], selected: string | undefined }>()
const emit = defineEmits(['update:modelValue'])
function handler(event: Event) {
    emit('update:modelValue', (event.target as HTMLSelectElement).value)
}
</script>

<template>
    <select name="" id="" @change="handler" :value="props.selected">
        <!-- v-show="option!=props.selected" -->
        <option :value="option" v-for="option in props.options">
            {{ option }}
        </option>
    </select>
</template>

<style scoped lang="scss">
select {
    font-size: 1rem;
    background-color: $bg_dark;
    @include gs-bd-clicked;
    height: 1.5rem;
    width: 7.5rem;
    padding-left: 3px;
    color: var(--text_regular);
    cursor: pointer;

    option {
        background-color: $bg_light;
        margin: 0;

        &:hover {
            color: var(--text_active);
        }
    }
}
</style>