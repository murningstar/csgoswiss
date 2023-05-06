import type { Grenade } from "@/data/_old/Grenade";
export interface Smoke extends Grenade {
    isOnewaySmoke: boolean;
    isFakeSmoke: boolean;
    isBugSmoke: boolean;
}
