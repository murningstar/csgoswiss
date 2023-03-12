<script setup lang="ts">
const props = defineProps(['checkId', 'modelValue'])
const emit = defineEmits(['update:modelValue'])
function onChange(event: Event) {
    emit('update:modelValue', (event.target as HTMLInputElement).checked)
    console.log((event.target as HTMLInputElement).checked);
}
</script>

<template>
    <input type="checkbox" :id="checkId" :checked="props.modelValue"
        @change="onChange($event)">
    <label :for="checkId">
        <slot>

        </slot>
    </label>
</template>

<style scoped lang="scss">
input {
    appearance: none;
    display: block;
    cursor: pointer;
    height: 0.9375rem;
    width: 0.9375rem;
    border-radius: 3px;
    border: 1px solid #70685f;

    &:checked {
        background-image: url('@/assets/ui/ui_checked.webp');
        background-size: 11px 11px;
        background-repeat: no-repeat;
        background-position: center;

        &+label {
            color: $text_active;
        }
    }
    &:hover{
        cursor: pointer;
    }
}

label {
    margin-left: 0.625rem;
    display: flex;
    align-items: center;
    &:hover{
        cursor: pointer;
    }
}
</style>