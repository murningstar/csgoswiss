import type { CoordsObj } from "../types/GrenadeProperties";

export interface Spot {
    spotId: string;
    name: string;
    coords: CoordsObj;
    toSrc?: string;
    toSrc2?: string;
    fromSrc_fp?: string;
    fromSrc_tp?: string;
    /* priority: Если выбран fp, то fp будет отображаться изначально, а tp - onhover */
    /* priority может быть undefined, если у спота есть только toSrc/toSrcs2 (нет from) */
    priority?: "fp" | "tp";
}
