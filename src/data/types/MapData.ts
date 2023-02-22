import type { Smoke } from "@/data/classes/Smoke";
import type { Molotov } from "@/data/classes/Motolov";
import type { Flash } from "@/data/classes/Flash";
import type { He } from "@/data/classes/He";

export type MapData = {
    smokes: Smoke[];
    molotovs: Molotov[];
    flashes: Flash[];
    hes: He[];
};
