import type { Lineup } from "./Lineup";
import type { Spot } from "./Spot";

export type MapItems = {
    spots: Map<Spot["spotId"], Spot>;
    lineups: Map<Lineup["lineupId"], Lineup>;
};
