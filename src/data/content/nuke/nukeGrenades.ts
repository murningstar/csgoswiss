import type { Lineup } from "../../interfaces/Lineup";
import type { MapItems } from "../../types/MapItems";
import { spots_nuke } from "./spots_nuke";
import { lineups_nuke } from "./lineups_nuke";

export const nukeGrenades: MapItems = {
    spots: spots_nuke,
    lineups: lineups_nuke,
};
