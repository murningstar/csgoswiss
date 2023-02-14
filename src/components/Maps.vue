<script lang="ts" setup>
/* Если удалить этот коментарий, то Vue какого-то %$@ не создаст 
параметр __name для компонента(нужно при регистрации компонента) */
</script>

<template>
    <!-- Компонент Maps.vue существует отдельно, т.к. изначально было сделано по компоненту
	под каждую карту. Для SPA такой подход выглядит не совсем логично, поэтому был сделан 
    компонент SingleMap.vue. Но Maps.vue все еще существует для возможной дальнейшей 
    интеграции Nuxt (MPA не MPA, че как там работают компоненты я просто хз). Моя догадка 
    заключается в том что, как мне опять же кажется, на каждый отдельный маршрут(/mirage,/dust2...) 
    должен быть отдельный view или че-то типо того. -->
    <div class="mapsWrapper">
        <SingleMap @mapLoaded="$emit('mapLoaded')" class="mapContainer" />
    </div>
</template>

<style lang="scss">
$border_light: rgb(135, 147, 127);
$border_dark: rgb(35, 41, 27);
$bg_light: rgb(75, 87, 67);
$bg_dark: rgba(53, 61, 46, 1);

.mapsWrapper {
    // justify-self: center;
    border-top: 1px solid var(--border_light);
    border-left: 1px solid var(--border_light);
    border-bottom: 1px solid var(--border_dark);
    border-right: 1px solid var(--border_dark);
    // border: 5px solid red;
    margin: 8px;
    padding: 10px;
    background-color: var(--bg_light);
    max-height: 100%;
    min-height: 0;
    aspect-ratio: 1/1;
}
</style>
