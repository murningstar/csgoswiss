import type { Smoke } from "@/data/interfaces/Smoke";
import type { Molotov } from "@/data/interfaces/Motolov";
import type { Flash } from "@/data/interfaces/Flash";
import type { He } from "@/data/interfaces/He";
import type { ThrowSpot } from "@/data/interfaces/ThrowSpot";

export type MapItems = {
    smokes: Smoke[];
    molotovs: Molotov[];
    flashes: Flash[];
    hes: He[];
    throwSpots: ThrowSpot[];
};
