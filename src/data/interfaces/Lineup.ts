import type {
    Difficulty,
    ForWhom,
    NadeType,
    Side,
    ThrowClick,
    ThrowMovement,
    Tickrate,
} from "../types/GrenadeProperties";

export interface Lineup {
    lineupId: string;
    toId: string;
    fromId: string;
    nadeType: NadeType;
    name: string;
    /* Потом буду еще категоризировать эти imgFile, 
    т.к. буду добавлять либо гифки либо вставки видео из ютуба
    и => изменю сам type Lineup */
    imgSrcAim: string | null;
    imgSrcAimZoom: string | null;
    imgSrcOverview: string | null;
    side: Side;
    tickrate: Tickrate;
    comboLineupIds?: Lineup["lineupId"][];
    throwClick: ThrowClick;
    throwMovement: ThrowMovement;
    difficulty: Difficulty;
    forWhom?: ForWhom;
}
