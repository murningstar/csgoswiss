import type { Lineup } from "../interfaces/Lineup";
import type { LineActorRef } from "@/machines/lineMachine";

export type LineActorsHashMap = {
    value: Map<`${Lineup["landId"]}<-${Lineup["throwId"]}`, LineActorRef>;
};
