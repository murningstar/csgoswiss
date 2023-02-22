import { Grenade } from "@/data/classes/Grenade";
import type {
    CoordsObj,
    Side,
    Tickrate,
    throwClick,
    throwMovement,
} from "@/data/types/GrenadeProperties";
export class Smoke extends Grenade {
    isOneWay: boolean;
    constructor(
        positionName: string,
        coords: CoordsObj,
        side: Side,
        tickrate: Tickrate,
        throwMovement: throwMovement,
        throwClick: throwClick,
        isOneWay: boolean
    ) {
        super(positionName, coords, side, tickrate, throwMovement, throwClick);
        this.isOneWay = isOneWay;
    }
}
