import type {
    CoordsObj,
    Side,
    Tickrate,
    ThrowClick,
    ThrowMovement,
    Difficulty,
} from "@/data/types/GrenadeProperties";
import type { ThrowSpot } from "@/data/interfaces/ThrowSpot";
export interface Grenade {
    id: string;
    coords: CoordsObj;
    name: string;
    throwSpotsIds: [ThrowSpot["id"], ...ThrowSpot["id"][]]; // min 1 string
    side: Side;
    tickrate: Tickrate;
    comboIds?: Grenade["id"][];
    throwClick: ThrowClick;
    throwMovement: ThrowMovement;
    difficulty: Difficulty;
}
