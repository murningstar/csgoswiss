import type { Grenade } from "@/data/interfaces/Grenade";
import type { ForWhom } from "../types/GrenadeProperties";
export interface Flash extends Grenade {
    forWhom: ForWhom
}
