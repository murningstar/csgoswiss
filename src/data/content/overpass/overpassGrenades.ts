import type { Lineup } from "../../interfaces/Lineup";
import type { MapItems } from "../../types/MapItems";
import { spots_overpass } from "./spots_overpass";
import { lineups_overpass } from "./lineups_overpass";

export const overpassGrenades: MapItems = {
    spots: spots_overpass,
    lineups: lineups_overpass,
};
