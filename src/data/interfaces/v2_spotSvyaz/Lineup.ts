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
    lineupId: string;
    toId: Spot["spotId"];
    fromId: Spot["spotId"];
    nadeType: NadeType;
    side: Side;
    tickrate: Tickrate;
    comboLineupIds?: Lineup["lineupId"][];
    throwClick: ThrowClick;
    throwMovement: ThrowMovement;
    difficulty: Difficulty;
}
