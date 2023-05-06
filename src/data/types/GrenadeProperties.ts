export type CoordsObj = {
    x: number;
    y: number;
};
export type Side = "ct" | "t";
export type Tickrate = 64 | 128;
export type ThrowMovement = "regular" | "jumpthrow" | "runthrow" | "onTheFeel";
export type ThrowClick = "leftclick" | "doubleclick" | "rightclick";
export type Difficulty = "easy" | "medium" | "hard" | "pixelPerfect";
export type ForWhom = "yourself" | "teammate";
export type NadeType = "smoke" | "molotov" | "flash" | "he";

export type ViewCountSide = {
    [key in Side]: number;
};
export type ViewCountTickrate = {
    [key in Tickrate]: number;
};
export type ViewCountThrowMovement = {
    [key in ThrowMovement]: number;
};
export type ViewCountThrowClick = {
    [key in ThrowClick]: number;
};
export type ViewCountDifficulty = {
    [key in Difficulty]: number;
};
export type ViewCountForWhom = {
    [key in ForWhom]: number;
};
export type ViewCountNadeType = {
    [key in NadeType]: number;
};
