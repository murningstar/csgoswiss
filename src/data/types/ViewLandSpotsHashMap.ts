import type { Spot } from "../interfaces/Spot";
import type { ViewLandSpot } from "./ViewItems";

export type ViewLandSpotsHashMap = { value: Map<Spot["spotId"], ViewLandSpot> };
