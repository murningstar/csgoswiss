<script setup lang="ts">
import GS_Window from "@/components/UI/GS_Window.vue";
import type { Lineup } from "@/data/interfaces/Lineup";
import type { SelectFormThrowSpotContext } from "@/data/types/SelectFormContexts";
import type {
    ViewLandSpot,
    ViewLine,
    ViewThrowSpot,
} from "@/data/types/ViewItems";
import { computed, onUnmounted } from "vue";

const props = defineProps<{
    context: SelectFormThrowSpotContext;
}>();
onUnmounted(() => {
    props.context.value.reset();
});

const viewItemsContainerToSelect = computed(() => {
    const viewThrowSpot = props.context.value.viewThrowSpot!; // ! - ?
    if ("activeLineupsToBeSelected" in props.context.value) {
        return props.context.value.activeLineupsToBeSelected!.map((lineup) => ({
            viewThrowSpot: viewThrowSpot,
            lineup: lineup,
            viewLandSpot: viewThrowSpot.factory.viewLandSpots.value.get(
                lineup.landId,
            )!,
        }));
    }
});
const viewItemsContainerToDeselect = computed(() => {
    const viewThrowSpot = props.context.value.viewThrowSpot!; // ! - ?
    if ("selectedLineupsToBeDeselected" in props.context.value) {
        return props.context.value.selectedLineupsToBeDeselected!.map(
            (lineup) => ({
                viewThrowSpot: viewThrowSpot,
                lineup: lineup,
                viewLandSpot: viewThrowSpot.factory.viewLandSpots.value.get(
                    lineup.landId,
                )!,
            }),
        );
    }
});

const emit = defineEmits(["exit", "select", "deselect"]);
const handlers = {
    select: (lineup: Lineup) => {
        const viewThrowSpot = props.context.value.viewThrowSpot!;
        const viewLine = viewThrowSpot.factory.viewLines.value.get(
            `${lineup.landId}<-${lineup.throwId}`,
        )!;
        const viewLandSpot = viewThrowSpot.factory.viewLandSpots.value.get(
            lineup.landId,
        )!;
        viewThrowSpot.$send("selectFormThrowSpotSelected", lineup.lineupId);
        viewLine.$send("selectFormThrowSpotSelected", lineup.lineupId);
        viewLandSpot.$send("selectFormThrowSpotSelected", lineup.lineupId);
        props.context.value.close();
    },
    deselect: (lineup: Lineup) => {
        const viewThrowSpot = props.context.value.viewThrowSpot!;
        const viewLine = viewThrowSpot.factory.viewLines.value.get(
            `${lineup.landId}<-${lineup.throwId}`,
        )!;
        const viewLandSpot = viewThrowSpot.factory.viewLandSpots.value.get(
            lineup.landId,
        )!;
        viewThrowSpot.$send("selectFormThrowSpotDeselected", lineup.lineupId);
        viewLine.$send("selectFormThrowSpotDeselected", lineup.lineupId);
        viewLandSpot.$send("selectFormThrowSpotDeselected", lineup.lineupId);
        props.context.value.close();
    },
    exit: () => props.context.value.close(),
};
</script>

<template>
    <Teleport to="body">
        <GS_Window @exit="handlers.exit">
            <template #title>
                Choose what to do with clicked throw spot
            </template>
            <template #default>
                <div
                    v-for="{
                        viewThrowSpot,
                        lineup,
                        viewLandSpot,
                    } in viewItemsContainerToSelect"
                    @click="handlers.select(lineup)"
                    :style="{ '--hsl': `${viewLandSpot.hslColor.value}` }"
                    class="sdContainer"
                >
                    <span class="select sd">+SELECT </span>
                    <span class="to">{{ viewLandSpot.landSpot.name }}</span>
                    <span>
                        lineup (from {{ viewThrowSpot.throwSpot.name }})</span
                    >
                </div>
                <div
                    v-for="{
                        viewThrowSpot,
                        lineup,
                        viewLandSpot,
                    } in viewItemsContainerToDeselect"
                    @click="handlers.deselect(lineup)"
                    :style="{ '--hsl': `${viewLandSpot.hslColor.value}` }"
                    class="sdContainer"
                >
                    <span class="deselect sd">-DESELECT </span>
                    <span class="to">{{ viewLandSpot.landSpot.name }}</span>
                    <span>
                        lineup (from {{ viewThrowSpot.throwSpot.name }})</span
                    >
                </div>
            </template>
        </GS_Window>
    </Teleport>
</template>

<style scoped lang="scss">
.select {
    color: hsl(120, 100%, 50%);
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

    &:hover {
        background-color: $bg_dark;
    }
}

.sd {
    min-width: 5.4rem;
}
</style>
