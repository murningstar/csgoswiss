import type { Grenade } from "@/data/_old/Grenade";
import type {
    CoordsObj,
    Side,
    Tickrate,
    ThrowClick,
    ThrowMovement,
    Difficulty
} from "@/data/types/GrenadeProperties";
export interface Molotov extends Grenade {
    isOnewayMolotov: boolean;
    isFakeMolotov:boolean;
    isBugMolotov:boolean;
}
