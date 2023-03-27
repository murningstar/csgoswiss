import type { Lineup } from "./Lineup";
import type { Spot } from "./Spot";

export type MapItems = {
    spots: Map<Spot["id"], Spot>;
    lineups: Map<Lineup["id"], Lineup>;
};
