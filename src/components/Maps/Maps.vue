<script lang="ts" setup>
/* Компонент Maps.vue существует отдельно, т.к.изначально было сделано по компоненту
под каждую карту.Для SPA такой подход выглядит не совсем логично, поэтому был сделан 
компонент SingleMap.vue.Но Maps.vue все еще существует для возможной дальнейшей 
интеграции Nuxt(MPA не MPA, че как там работают компоненты я просто хз).Моя догадка 
заключается в том что, как мне опять же кажется, на каждый отдельный маршрут(/mirage,/dust2...) 
должен быть отдельный view или че - то типо того. */

/* Если удалить этот коментарий(оставить script пустым), то Vue какого-то %$@ не создаст 
параметр __name для компонента(нужно при регистрации компонента) */
</script>

<template>
    <div class="mapsWrapper">
        <router-view>

        </router-view>
        <!-- <SingleMap /> -->
    </div>
</template>

<style lang="scss">
$border_light: rgb(135, 147, 127);
$border_dark: rgb(35, 41, 27);
$bg_light: rgb(75, 87, 67);
$bg_dark: rgba(53, 61, 46, 1);

.mapsWrapper {
    flex-grow: 1;
    min-height: 0;
    @include gs-bd;
    margin: 0px 8px 8px 8px;
    padding: 10px;
    background-color: var(--bg_light);
    // border: orange 5px solid;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
</style>
