<template>
  <div class="mapsWrapper">
    <router-view
      @mapLoaded="$emit('mapLoaded')"
      class="mapContainer"
      v-slot="{ Component }"
    >
      <transition name="changeMapToLeft" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script>
export default {
  name: "maps",
};
</script>

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
  .mapContainer {
    min-height: 0;
    margin: 0 auto;
    max-height: 100%;
    aspect-ratio: 1/1;
    display: flex;
    border: 5px solid orange;
    border: 15px solid var(--bg_dark);
    position: relative;
    box-shadow: -1px -1px 0 0 var(--border_dark),
      1px 1px 0 0 var(--border_light);
    .mapImg {
      // border: 5px solid yellow;
      max-width: 100%;
      max-height: 100%;
      // aspect-ratio: 1/1;
      background-color: var(--bg_dark);
    }
  }
}

/* 
        Animations 
    */
.changeMapToLeft-enter-from {
  opacity: 0;
  transform: scale(0.9, 0.9) translateX(-100px);
}
.changeMapToLeft-enter-active {
  transition: all 0.33s cubic-bezier(0.19, 1, 0.22, 1);
}
.changeMapToLeft-leave-active {
  transition: all 0.4s cubic-bezier(0.55, 0.085, 0.68, 0.53);
}
.changeMapToLeft-leave-to {
  opacity: 0;
  transform: scale(0.9, 0.9) translateX(100px);
}

.changeMapToRight-enter-from {
  opacity: 0;
  transform: scale(0.9, 0.9) translateX(100px);
}
.changeMapToRight-enter-active {
  transition: all 0.33s cubic-bezier(0.19, 1, 0.22, 1);
}
.changeMapToRight-leave-active {
  transition: all 0.4s cubic-bezier(0.55, 0.085, 0.68, 0.53);
}
.changeMapToRight-leave-to {
  opacity: 0;
  transform: scale(0.9, 0.9) translateX(-100px);
}
</style>
