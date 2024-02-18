import { useActorRef } from "@xstate/vue";
import { setup } from "xstate";

export const lineMachine = setup({}).createMachine({});

export type LineMachine = typeof lineMachine;

const lineActor = useActorRef(lineMachine, { input: {} });

export type LineActorRef = typeof lineActor;
