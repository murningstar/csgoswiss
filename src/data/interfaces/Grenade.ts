import type {
    CoordsObj,
    Side,
    Tickrate,
    ThrowClick,
    ThrowMovement,
    Difficulty,
} from "@/data/types/GrenadeProperties";
export interface Grenade {
    idCrypto: string;
    coords: CoordsObj;
    name: string;
    throwSpotsIds:string[];
    side: Side;
    tickrate: Tickrate;
    comboIds?:string[]; //optional
    throwClick: ThrowClick;
    throwMovement: ThrowMovement;
    difficulty: Difficulty;
}
