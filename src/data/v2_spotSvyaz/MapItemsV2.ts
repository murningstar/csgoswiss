import type { Lineup } from "@/data/v2_spotSvyaz/Lineup";
import type { Spot } from "@/data/v2_spotSvyaz/Spot";

export type MapItems = {
    spots: Map<Spot["spotId"], Spot>;
    lineups: Map<Lineup["lineupId"], Lineup>;
};
