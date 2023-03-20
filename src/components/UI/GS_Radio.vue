<script setup lang="ts">
import type { PropType } from 'vue';

const props = defineProps({
    options: {
        type: Array as PropType<string[] | number[]>
    },
    modelValue: [String, Number],
    radioName: String
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
    <div class="gs_radio">
        <div class="gs_radio__elem" v-for="option in props.options">
            <input type="radio" :name="radioName" :id="option.toString()"
                :checked="modelValue == option"
                @change="emit('update:modelValue', option)">
            <label :for="option.toString()">{{ option }}</label>
        </div>
    </div>
</template>

<style scoped lang="scss">
.gs_radio {
    min-width: 8rem;
    @include gs-bd-clicked;
    padding: 2px 8px;
    color: $text_disabled;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: $bg_light;

    &__elem {
        flex: 1 1 0px;
        display: flex;
        align-items: center;
        margin-right: 0.625rem;

        input {
            appearance: none;
            display: block;
            height: 0.9375rem;
            width: 0.9375rem;
            border-radius: 3px;
            border: 1px solid #70685f;

            &:hover {
                cursor: pointer;

                &+label {
                    color: $text_regular;

                }
            }

            &:checked {
                background-color: var(--text_active);
                border: 2px solid #70685f;

                &+label {
                    color: $text_regular;
                }
            }
        }

        label {
            display: block;
            margin-left: 5px;

            &:hover {
                cursor: pointer;
                color: $text_regular;
            }
        }
    }
}
</style>