import type { Spot } from "@/data/v2_spotSvyaz/Spot";
import type {
    Difficulty,
    NadeType,
    Side,
    ThrowClick,
    ThrowMovement,
    Tickrate,
} from "@/data/types/GrenadeProperties";

export interface Lineup {
    lineupId: string;
    landId: Spot["spotId"];
    throwId: Spot["spotId"];
    nadeType: NadeType;
    side: Side;
    tickrate: Tickrate;
    comboLineupIds?: Lineup["lineupId"][];
    throwClick: ThrowClick;
    throwMovement: ThrowMovement;
    difficulty: Difficulty;
}
