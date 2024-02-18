import type { Lineup } from "@/data/interfaces/Lineup";
import type { Spot } from "@/data/interfaces/Spot";
import type {
    SelectFormMediator,
    ViewActorsFactory,
    ViewLine,
    ViewSpotStateUnion,
} from "@/data/types/ViewItems";
import { useActor, useActorRef } from "@xstate/vue";
import { createActor, createMachine, raise, setup } from "xstate";

export const spotMachine = setup({
    types: {
        context: {} as {
            spot: Spot;
            lineups: Set<Lineup>;
            observingViewLines: Set<ViewLine>; // ⚠️
            avgDuration: string | null;
            hslColor: string | null;
            mediator: SelectFormMediator;
            factory: ViewActorsFactory;
        },
        input: {} as {
            initialType: "land" | "throw";
            spot: Spot;
            mediator: SelectFormMediator;
            factory: ViewActorsFactory;
        },
    },
}).createMachine({
    initial: "UNSPOILED",
    entry: ({ event, context }) => {},
    context: ({ input }) => ({
        spot: input.spot,
        lineups: new Set(),
        observingViewLines: new Set(),
        avgDuration: "3.0",
        hslColor: null,
        mediator: input.mediator,
        factory: input.factory,
    }),
    states: {
        UNSPOILED: {
            on: {
                initLand: "LAND_INACTIVE_UNSELECTED",
                initThrow: "THROW_ONLY_ACTIVE_SINGLE",
            },
        },
    },
    LAND_INACTIVE_UNSELECTED: {
        on: {
            selfClicked: {
                target: "LAND_ACTIVE",
            },
        },
    },
    LAND_ACTIVE: {
        on: {
            selfClicked: {
                target: "LAND_INACTIVE_UNSELECTED",
            },
        },
    },
    LAND_ONLY_SELECTED_SINGLE: {},
    LAND_ONLY_SELECTED_MULTIPLE: {},
    LAND_ACTIVE_AND_SELECTED: {},
    THROW_ONLY_ACTIVE_SINGLE: {},
    THROW_ONLY_ACTIVE_MULTIPLE: {},
    THROW_ONLY_SELECTED_SINGLE: {},
    THROW_ONLY_SELECTED_MULTIPLE: {},
    THROW_ACTIVE_AND_SELECTED: {},
    THROW_KILLED: {},
    BOTH_LAND_AND_THROW_SINGLE: {},
    BOTH_LAND_THROW_MULTIPLE: {},
});

export type SpotMachine = typeof spotMachine;

const spotActor = useActorRef(spotMachine, { input: {} });
export type SpotActorRef = typeof spotActor;
