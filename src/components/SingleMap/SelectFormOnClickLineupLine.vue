<script setup lang="ts">
import GS_Window from "@/components/UI/GS_Window.vue";
import type { selectFormContext } from "@/data/types/SelectFormContext";
import type {
    ViewLandSpot,
    ViewLine,
    ViewThrowSpot,
} from "@/data/types/ViewItems";
import { computed } from "vue";

const props = defineProps<{
    context: selectFormContext;
}>();
const viewItemsContainerToSelect = computed(() => {
    switch (props.context.value.clickedViewItemType) {
        case "viewThrowSpot": {
            const viewThrowSpot = props.context.value.viewItem as ViewThrowSpot;
            if ("activeLineupsToBeSelected" in props.context.value) {
                return props.context.value.activeLineupsToBeSelected!.map(
                    (lineup) => ({
                        viewThrowSpot: viewThrowSpot,
                        lineup: lineup,
                        viewLandSpot:
                            viewThrowSpot.factory.viewLandSpots.value.get(
                                lineup.landId,
                            ),
                    }),
                );
            }
            break;
        }
        case "viewLine": {
            /* todo */
            const viewLine = props.context.value.viewItem as ViewThrowSpot;
            break;
        }
        case "viewLandSpot": {
            /* todo */
            const viewLandSpot = props.context.value.viewItem as ViewLandSpot;
            break;
        }
    }
});
const viewItemsContainerToDeselect = computed(() => {});

const viewItemsContainer = computed(() => {
    switch (props.context.value.clickedViewItemType) {
        case "viewThrowSpot": {
            const viewThrowSpot = props.context.value.viewItem as ViewThrowSpot;
            if ("activeLineupsToBeSelected" in props.context.value) {
                return props.context.value.activeLineupsToBeSelected!.map(
                    (lineup) => ({
                        viewThrowSpot: viewThrowSpot,
                        lineup: lineup,
                        viewLandSpot:
                            viewThrowSpot.factory.viewLandSpots.value.get(
                                lineup.landId,
                            ),
                    }),
                );
            } else if ("selectedLineupsToBeDeselected" in props.context.value) {
                return props.context.value.selectedLineupsToBeDeselected!.map(
                    (lineup) => ({}),
                );
            }
            break;
        }
        case "viewLine": {
            /* todo */
            const viewLine = props.context.value.viewItem as ViewThrowSpot;
            break;
        }
        case "viewLandSpot": {
            /* todo */
            const viewLandSpot = props.context.value.viewItem as ViewLandSpot;
            break;
        }
    }
});

const viewItemTypeForTitle = computed(() => {
    if (props.context.value.clickedViewItemType == "viewThrowSpot") {
        return "throw spot";
    }
    if (props.context.value.clickedViewItemType == "viewLine") {
        return "lineup line";
    }
    if (props.context.value.clickedViewItemType == "viewLandSpot") {
        return "land spot";
    }
});

const emit = defineEmits(["exit", "select", "deselect"]);
// const handlers = {
//     select: (lineupItem: LineupItem) =>
//         emit("select", lineupItem.lineup.lineupId),
//     deselect: (lineupItem: LineupItem) =>
//         emit("deselect", lineupItem.lineup.lineupId),
//     exit: () => emit("exit"),
// };
</script>

<template>
    <Teleport to="body">
        <GS_Window @exit="">
            <template #title>
                Choose what to do with clicked {{ viewItemTypeForTitle }}
            </template>
            <template #default>
                <div
                    v-for="lineup in context.value.activeLineupsToBeSelected"
                    @click="handlers.select(lineupItem)"
                    :style="{ '--hsl': viewToSpot.hslColor }"
                    class="sdContainer"
                >
                    <span class="select sd">+SELECT </span>
                    <span class="to">{{ viewToSpot.toSpot.name }}</span>
                    <span> lineup (from {{ viewFromSpot.fromSpot.name }})</span>
                </div>
                <div
                    v-for="{
                        lineupItem,
                        viewToSpot,
                        viewFromSpot,
                    } in selectedLineups"
                    @click="handlers.deselect(lineupItem)"
                    :style="{ '--hsl': viewToSpot.hslColor }"
                    class="sdContainer"
                >
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

    &:hover {
        background-color: $bg_dark;
    }
}

.sd {
    min-width: 5.4rem;
}
</style>
@/data/types/SelectFormThrowSpotContext
