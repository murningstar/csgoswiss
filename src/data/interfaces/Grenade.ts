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
    name: string;
    coords: CoordsObj;
    comboIds:string[];
    throwSpotsIds:string[];
    difficulty: Difficulty;
    side: Side;
    tickrate: Tickrate;
    throwClick: ThrowClick;
    throwMovement: ThrowMovement;
}
