import type {
    CoordsObj,
    Side,
    Tickrate,
    throwClick,
    throwMovement,
} from "@/data/types/GrenadeProperties";
export abstract class Grenade {
    positionName: string;
    coords: CoordsObj;
    side: Side;
    throwMovement: throwMovement;
    throwClick: throwClick;
    tickrate: 128 | 64;
    constructor(
        positionName: string,
        coords: CoordsObj,
        side: Side,
        tickrate: Tickrate,
        throwMovement: throwMovement,
        throwClick: throwClick
    ) {
        this.positionName = positionName;
        this.coords = coords;
        this.side = side;
        this.tickrate = tickrate;
        this.throwMovement = throwMovement;
        this.throwClick = throwClick;
    }
}
