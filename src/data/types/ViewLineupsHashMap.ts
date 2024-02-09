import type { Lineup } from "@/data/interfaces/Lineup";
import type { ViewLineup } from "./ViewItems";

export type ViewLineupsHashMap = { value: Map<Lineup["lineupId"], ViewLineup> };
