<script setup lang="ts">
import { computed } from 'vue';
import { useSomestore } from '@/stores/somestore';
const store = useSomestore()
const buttonContent = computed(() => store.isCmsModeOn ? 'x' : '+')
const buttonBgColor = computed(() => store.isCmsModeOn ? 'indianred' : 'aqua')
</script>

<template>
    <div class="addGrenadeBtn" :style="{ backgroundColor: buttonBgColor }" @click="store.toggleCmsMode()"> 
        {{ buttonContent }}
    </div>
</template>


<style scoped lang="scss">
.addGrenadeList {
    border-radius: 5px;
    border: 2px black solid;
    position: fixed;
    padding: 10px 20px;
    background-color: rgba(0, 0, 0, 0.281);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    list-style: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-shadow: 0 0 25px -5px black;

    &__grenade {
        cursor: pointer;

        &:hover {
            text-shadow: 0 0 2px rgba(0, 0, 0, 0.466);
            color: white;
        }
    }
}

.addGrenadeBtn {
    position: fixed;
    top: 10px;
    right: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
    padding: 0;
    width: 50px;
    height: 50px;
    border-radius: 10px;
    border: 3px solid rgb(0, 0, 0);
    font-size: 18px;
    font-weight: bold;
    box-shadow: 0 0 30px black;
    filter: saturate(0.5);
    cursor: pointer;

    &:hover {
        color: white;
        text-shadow: 0 0 2px #00000081;
        filter: saturate(1);
    }
}
</style>