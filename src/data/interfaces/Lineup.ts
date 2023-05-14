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
    srcAim?: string;
    srcOverview?: string;
    srcOverview2?: string;
    /* priority: Если выбран 1, то overview будет 
    отображаться изначально, а overview2 - onhover */
    priority?: 1 | 2;
    side: Side;
    tickrate: Tickrate;
    comboLineupIds?: Lineup["lineupId"][];
    throwClick: ThrowClick;
    throwMovement: ThrowMovement;
    difficulty: Difficulty;
    forWhom?: ForWhom;
}
