import type { Grenade } from "@/data/interfaces/Grenade";
export interface Smoke extends Grenade {
    isOnewaySmoke: boolean;
    isFakeSmoke: boolean;
    isBugSmoke: boolean;
}
