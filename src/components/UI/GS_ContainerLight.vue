<script setup lang="ts">
    
</script>

<template>
    <div class="gs_containerLight">
        <slot>

        </slot>
    </div>
</template>

<style scoped lang="scss">
.gs_containerLight{
    @include gs-bd;

    background-color: var(--bg_light);
    padding: 30px 40px 30px 40px;
    width: fit-content;
    min-width: 27rem;
    max-width: 80%;
    max-height: 79vh;
    overflow-y: scroll;
}
</style>