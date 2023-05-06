import { z } from "zod";

export const lineupSchema = z.object({
    lineupId: z.string().length(13),
    toId: z.string().length(13),
    fromId: z.string().length(13),
    nadeType: z.union([
        z.literal("smoke"),
        z.literal("molotov"),
        z.literal("flash"),
        z.literal("he"),
    ]),
    side: z.union([z.literal("ct"), z.literal("t")]),
    tickrate: z.union([z.literal(64), z.literal(128)]),
    comboLineupIds: z.array(z.string().length(13)).optional(),
    throwClick: z.union([
        z.literal("leftclick"),
        z.literal("doubleclick"),
        z.literal("rightclick"),
    ]),
    throwMovement: z.union([
        z.literal("regular"),
        z.literal("jumpthrow"),
        z.literal("runthrow"),
        z.literal("onTheFeel"),
    ]),
    difficulty: z.union([
        z.literal("easy"),
        z.literal("medium"),
        z.literal("hard"),
        z.literal("pixelPerfect"),
    ]),
    forWhom: z.union([z.literal("yourself"), z.literal("teammate")]).optional(),
});
