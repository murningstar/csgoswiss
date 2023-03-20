import type { CoordsObj } from "@/data/types/GrenadeProperties";
export interface ThrowSpot {
    id: string;
    // name: string; Пока убрал мб потом добавлю если понадобится
    coords: CoordsObj;
    toIds: string[]; // toIds - куда кидается
    isSpecial: boolean; // есть отдельный фильтр для особенных спотов, которых например можно кинуть >1 смока
}
