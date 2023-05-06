import type { Lineup } from "@/data/interfaces/Lineup";
import type { Spot } from "@/data/interfaces/Spot";

export type MapItems = {
    spots: Map<Spot["spotId"], Spot>;
    lineups: Map<Lineup["lineupId"], Lineup>;
};
