import type { Lineup } from "@/data/interfaces/Lineup";
import type { ViewLandSpot, ViewLine, ViewThrowSpot } from "./ViewItems";

export type ViewLinesHashMap = {
    value: Map<
        `${ViewLandSpot["landSpot"]["spotId"]}<-${ViewThrowSpot["throwSpot"]["spotId"]}`,
        ViewLine
    >;
};
