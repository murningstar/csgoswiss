import type { Grenade } from "@/data/_old/Grenade";
import type { ForWhom } from "../types/GrenadeProperties";
export interface Flash extends Grenade {
    forWhom: ForWhom
}
