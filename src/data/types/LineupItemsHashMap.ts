import type { Lineup } from "@/data/interfaces/Lineup";
import type { LineupItem } from "./ViewItems";

export type LineupItemsHashMap = { value: Map<Lineup["lineupId"], LineupItem> };
