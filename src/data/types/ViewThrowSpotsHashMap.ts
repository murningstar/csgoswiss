import type { Spot } from "../interfaces/Spot";
import type { ViewThrowSpot } from "./ViewItems";

export type ViewThrowSpotsHashMap = {
    value: Map<Spot["spotId"], ViewThrowSpot>;
};
