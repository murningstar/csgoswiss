<script setup lang="ts">
import GS_ExitBtn from './GS_ExitBtn.vue';
const emit = defineEmits(['exit'])
</script>

<template>
    <div class="bgDarker">
        <div class="gs_window">
            <div class="gs_window__heading">
                <img class="gs_window__icon" src="@/assets/ui_logo_beta.webp">
                <span class="gs_window__title">
                    <slot name="title"></slot>
                </span>
                <GS_ExitBtn style="margin-right: 2px;" @exit="emit('exit')" />
            </div>
            <div class="gs_window__content">
                <slot>
                    There should have been content here...
                </slot>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.gs_window {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 0 5px 9px 5px;
    background: $bg_light;
    @include gs-bd;
    border: 2px solid $border_light;

    &__heading {
        display: flex;
        align-items: center;
        height: 37px;
    }

    &__icon {
        display: block;
        width: 17px;
        height: 17px;
        object-fit: contain;
        // border: 1px solid red;
    }

    &__title {
        color: white;
        margin-left: 4px;
        margin-right: 5px;
        font-size: 1rem;
        justify-self: flex-start;
    }

    &__content {}
}

.bgDarker {
    top: 0;
    left: 0;
    position: fixed;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.13);
}
</style>