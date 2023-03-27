import type { Spot } from "@/data/interfaces/v2_spotSvyaz/Spot";
import type {
    Difficulty,
    NadeType,
    Side,
    ThrowClick,
    ThrowMovement,
    Tickrate,
} from "@/data/types/GrenadeProperties";

export interface Lineup {
    id: string;
    land: Spot["id"];
    throw: Spot["id"];
    nadeType: NadeType;
    side: Side;
    tickrate: Tickrate;
    comboIds?: Lineup["id"][];
    throwClick: ThrowClick;
    throwMovement: ThrowMovement;
    difficulty: Difficulty;
}
