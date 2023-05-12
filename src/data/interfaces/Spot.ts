import type { CoordsObj } from "../types/GrenadeProperties";

export interface Spot {
    spotId: string;
    name: string;
    coords: CoordsObj;
    toSrc_1: string | null;
    toSrc_2: string | null;
    fromSrc_fp: string | null;
    fromSrc_tp: string | null;
}
