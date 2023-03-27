import type { CoordsObj } from "../types/GrenadeProperties";

export interface Spot {
    spotId: string;
    name: string;
    // type: 'land' | 'throw'
    coords: CoordsObj;
}
