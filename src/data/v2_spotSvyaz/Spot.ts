import type { CoordsObj } from "../types/GrenadeProperties";

export interface Spot {
    spotId: string;
    name: string;
    coords: CoordsObj;
    toImgSrc: string | null;
    fromImgSrc: string | null;
}
