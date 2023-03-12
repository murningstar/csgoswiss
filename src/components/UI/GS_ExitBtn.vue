<script setup lang="ts">
const emit = defineEmits(['exit'])
</script>

<template>
    <button @click="emit('exit')" class="exitBtn_cont">
        <div class="exitBtn_elem">

        </div>
    </button>
</template>

<style scoped lang="scss">
.exitBtn_cont {
    // кнопка будет всегда стремиться прижаться к правому углу
    margin-left: auto;
    @include gs-bd;
    display: block;
    border-radius: 0;
    width: 18px;
    height: 18px;
    overflow: hidden;
    background-color: $bg_light;

    .exitBtn_elem {
        width: 100%;
        height: 100%;
        background-image: url("@/assets/ui/ui_exit.webp");
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
    }

    &:active {
        @include gs-bd-clicked;
        box-shadow: none;
    }

    &:active .exitBtn_elem {
        transform: translate(1px, 1px);
    }
}
</style>