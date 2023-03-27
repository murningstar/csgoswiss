import type { Smoke } from "@/data/interfaces/Smoke";
import type { Molotov } from "@/data/interfaces/Motolov";
import type { Flash } from "@/data/interfaces/Flash";
import type { He } from "@/data/interfaces/He";
import type { ThrowSpot } from "@/data/interfaces/ThrowSpot";

export type MapItems = {
    smokes: Map<Smoke["id"], Smoke>;
    molotovs: Map<Molotov["id"], Molotov>;
    flashes: Map<Flash["id"], Flash>;
    hes: Map<He["id"], He>;
    throwSpots: Map<ThrowSpot["id"], ThrowSpot>;
};
