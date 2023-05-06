import type { Lineup } from "../../interfaces/Lineup";
import type { MapItems } from "../../types/MapItems";
import { spots_mirage } from "./spots_mirage";
import { lineups_mirage } from "./lineups_mirage";

export const mirageGrenades: MapItems = {
    spots: spots_mirage,
    lineups: lineups_mirage,
};
