import type { Spot } from "../interfaces/Spot";
import type { ViewToSpot} from "./ViewItems";

export type ViewToSpotsHashMap = { value: Map<Spot["spotId"], ViewToSpot> };
