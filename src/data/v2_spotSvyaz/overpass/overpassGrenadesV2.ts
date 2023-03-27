import type { Lineup } from "../Lineup";
import type { MapItems } from "../MapItemsV2";
import { spots_overpass } from "./spots_overpass";
import { lineups_overpass } from "./lineups_overpass";

export const overpassGrenades: MapItems = {
    spots: spots_overpass,
    lineups: lineups_overpass,
};
