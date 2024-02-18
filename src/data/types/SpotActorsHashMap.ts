import type { Spot } from "../interfaces/Spot";
import type { SpotActorRef } from "@/machines/spotMachine";

export type SpotActorsHashMap = { value: Map<Spot["spotId"], SpotActorRef> };
