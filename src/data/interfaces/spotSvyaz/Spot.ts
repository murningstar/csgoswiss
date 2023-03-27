import type { CoordsObj } from "../../types/GrenadeProperties";

export interface Spot {
    id: string;
    name: string;
    // type: 'land' | 'throw'
    coords: CoordsObj;
}
