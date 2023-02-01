<template>
     <div>
          <img
               @load="log"
               class="mapImg"
               src="@/assets/maps/mirage.webp"
               alt=""
          />
          <div
               class="pointContainer"
               v-for="point in points"
               :style="{
                    top: `${point.position.y}%`,
                    left: `${point.position.x}%`,
               }"
          >
               <button></button>
               <img class="sprite" src="@/assets/smoke_sprite.webp" alt="" />
          </div>
     </div>
</template>

<script>
import points from "./points.js";
export default {
     name: "mirage",
     mapId: 1,
     data: () => {
          return {
               points,
          };
     },
     methods: {
          async log() {
               this.$emit("mapLoaded");
               console.log(
                    "%c mirage img loaded",
                    "color:blue",
                    performance.now()
               );
          },
     },
     mounted() {
          console.log(
               "%c mirage_component mounted",
               "color: red",
               performance.now()
          );
     },
};
</script>

<style lang="scss" scoped>
.pointContainer {
     position: absolute;
     border-radius: 50%;
     aspect-ratio: 1;
     width: 1.6%;
     height: 1.6%;
     // box-shadow: 0 0 10px rgb(255, 0, 0);
     background-color: rgb(0, 68, 255);
     border: 2px solid rgb(0, 68, 255);
     z-index: 2;
     transform: translate(-50%, -50%);
}
button {
     position: absolute;
     width: 100%;
     height: 100%;
     background-color: rgba(255, 0, 0, 0.452);
     cursor: pointer;
     // border: 1px rgb(0, 114, 0) solid;
}
.sprite {
     width: 50px;
     height: 50px;
     position: absolute;
     // border: 1px red solid;
     z-index: -1;
     opacity: 50%;
     transform: translate(-41%, -41%);
}
</style>
