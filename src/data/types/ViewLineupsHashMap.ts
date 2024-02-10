import type { Lineup } from "@/data/interfaces/Lineup";
import type { ViewLine } from "./ViewItems";

export type ViewLinesHashMap = {
    value: Map<Lineup["lineupId"], ViewLine>;
};
