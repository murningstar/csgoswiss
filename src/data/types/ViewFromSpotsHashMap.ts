import type { Spot } from "../interfaces/Spot";
import type { ViewFromSpot2 } from "./ViewItems";

export type ViewFromSpotsHashMap = { value: Map<Spot["spotId"], ViewFromSpot2> };
