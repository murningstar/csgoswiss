import type { CoordsObj } from "../types/GrenadeProperties";

export interface Spot {
    spotId: string;
    name: string;
    coords: CoordsObj;
    toSrc?: string;
    toSrc2?: string;
    fromSrc_fp?: string;
    fromSrc_tp?: string;
}
