import type { Lineup } from "../../interfaces/Lineup";
import type { MapItems } from "../../types/MapItems";
import { spots_vertigo } from "./spots_vertigo";
import { lineups_vertigo } from "./lineups_vertigo";

export const vertigoGrenades: MapItems = {
    spots: spots_vertigo,
    lineups: lineups_vertigo,
};
