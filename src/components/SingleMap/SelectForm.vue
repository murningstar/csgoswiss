<script setup lang="ts">
import type { LineupItem, ViewFromSpot, ViewToSpot } from '@/data/types/ViewItems';
import GS_Window from "@/components/UI/GS_Window.vue";
import GS_ContainerLight from '@/components/UI/GS_ContainerLight.vue';
type ViewItemObj = {
    viewToSpot: ViewToSpot,
    viewFromSpot: ViewFromSpot,
    lineupItem: LineupItem
}
const props = defineProps<{
    isVisible: boolean,
    activeLineups: Array<ViewItemObj>,
    selectedLineups: Array<ViewItemObj>,
}>()
const emit = defineEmits(['exit', 'select', 'deselect'])
const handlers = {
    select: (lineupItem: LineupItem) => emit('select', lineupItem.lineup.lineupId),
    deselect: (lineupItem: LineupItem) => emit('deselect', lineupItem.lineup.lineupId),
    exit: () => emit('exit')
}
</script>

<template>
    <Teleport to="body">
        <GS_Window v-if="isVisible" @exit="handlers.exit">
            <template #title>
                Choose what to do with clicked throw spot
            </template>
            <template #default>
                <div v-for="{ lineupItem, viewToSpot, viewFromSpot } in activeLineups"
                    @click="handlers.select(lineupItem)"
                    :style="{ '--hsl': viewToSpot.hslColor }" class="sdContainer">
                    <span class="select sd">+SELECT </span>
                    <span class="to">{{ viewToSpot.toSpot.name }}</span>
                    <span> lineup (from {{ viewFromSpot.fromSpot.name }})</span>

                </div>
                <div v-for="{ lineupItem, viewToSpot, viewFromSpot } in selectedLineups"
                    @click="handlers.deselect(lineupItem)"
                    :style="{ '--hsl': viewToSpot.hslColor }" class="sdContainer">
                    <span class="deselect sd">-DESELECT </span>
                    <span class="to">{{ viewToSpot.toSpot.name }}</span>
                    <span> lineup (from {{ viewFromSpot.fromSpot.name }})</span>
                </div>
            </template>
        </GS_Window>
    </Teleport>
</template>

<style scoped lang="scss">
.select {
    color: rgb(0, 255, 0);
}

.deselect {
    color: red;
}

.to {
    color: hsl(var(--hsl), 100%, 60%);
    margin-right: 0.5rem;
}

.container {
    padding: 20px;
}

.sdContainer {
    cursor: pointer;
    display: inline-block;
    display: flex;
    padding: 0.1rem 0.5rem;
    &:hover{
        background-color: $bg_dark;
    }
}

.sd {
    min-width: 6rem;
}
</style>