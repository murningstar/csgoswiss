// stairs находился дальше jungle в массиве и отрисовывался над ним
import type { MapItems } from "@/data/types/MapItems";
export const mirageGrenades: MapItems = {
    smokes: new Map([
        [
            "EOOfF3gTmzrL2",
            {
                id: "EOOfF3gTmzrL2",
                coords: { x: 28.6, y: 18.3 },
                name: "b_short_left_arch",
                throwSpotsIds: ["gNx6wmZRJX_dv"],
                side: "t",
                tickrate: 128,
                // comboIds
                throwClick: "leftclick",
                throwMovement: "regular",
                difficulty: "easy",
                isOnewaySmoke: false,
                isFakeSmoke: false,
                isBugSmoke: false,
            },
        ],
        [
            "T81rq8FeVnKFg",
            {
                id: "T81rq8FeVnKFg",
                coords: { x: 28.6, y: 24.6 },
                name: "b_short_right_arch",
                throwSpotsIds: ["gNx6wmZRJX_dv"],
                side: "t",
                tickrate: 128,
                // comboIds
                throwClick: "leftclick",
                throwMovement: "regular",
                difficulty: "easy",
                isOnewaySmoke: false,
                isFakeSmoke: false,
                isBugSmoke: false,
            },
        ],
        [
            "q0ER3vmNRSe7a-9Zvyk",
            {
                id: "q0ER3vmNRSe7a-9Zvyk",
                coords: { x: 18.1, y: 35.1 },
                name: "b_kitchen_window",
                throwSpotsIds: ["gNx6wmZRJX_dv"],
                side: "t",
                tickrate: 128,
                // comboIds
                throwClick: "leftclick",
                throwMovement: "regular",
                difficulty: "easy",
                isOnewaySmoke: false,
                isFakeSmoke: false,
                isBugSmoke: false,
            },
        ],
        [
            "bozR5AccXBfmM",
            {
                id: "bozR5AccXBfmM",
                coords: { x: 36.1, y: 44.1 },
                name: "window",
                throwSpotsIds: ["gNx6wmZRJX_dv"],
                side: "t",
                tickrate: 128,
                // comboIds
                throwClick: "leftclick",
                throwMovement: "regular",
                difficulty: "easy",
                isOnewaySmoke: false,
                isFakeSmoke: false,
                isBugSmoke: false,
            },
        ],
        [
            "Bcn__DOHHfUT4",
            {
                id: "Bcn__DOHHfUT4",
                coords: { x: 48.3, y: 67.2 },
                name: "jungle",
                throwSpotsIds: [
                    "gNx6wmZRJX_dv",
                    "BfHgp4IsQezko",
                    "c2ZW10Z85iese",
                ],
                side: "t",
                tickrate: 128,
                // comboIds
                throwClick: "leftclick",
                throwMovement: "regular",
                difficulty: "easy",
                isOnewaySmoke: false,
                isFakeSmoke: false,
                isBugSmoke: false,
            },
        ],
        [
            "lRdZnqs18HiLW",
            {
                id: "lRdZnqs18HiLW",
                coords: { x: 53.1, y: 66.8 },
                name: "stairs",
                throwSpotsIds: ["c2ZW10Z85iese"],
                side: "ct",
                tickrate: 64,
                // comboIds
                throwClick: "doubleclick",
                throwMovement: "onTheFeel",
                difficulty: "pixelPerfect",
                isOnewaySmoke: true,
                isFakeSmoke: true,
                isBugSmoke: true,
            },
        ],
        [
            "Ug5qL_LbcBY1k",
            {
                id: "Ug5qL_LbcBY1k",
                coords: { x: 41.8, y: 86.0 },
                name: "ct",
                throwSpotsIds: ["BfHgp4IsQezko"],
                side: "t",
                tickrate: 128,
                // comboIds
                throwClick: "leftclick",
                throwMovement: "regular",
                difficulty: "easy",
                isOnewaySmoke: true,
                isFakeSmoke: true,
                isBugSmoke: true,
            },
        ],
    ]),
    molotovs: new Map([
        [
            "asd",
            {
                id: "asd",
                coords: {
                    x: 50,
                    y: 50,
                },
                difficulty: "easy",
                isBugMolotov: true,
                isFakeMolotov: true,
                isOnewayMolotov: true,
                name: "123asd",
                side: "t",
                throwClick: "doubleclick",
                throwMovement: "jumpthrow",
                throwSpotsIds: ["asd"],
                tickrate: 128,
                comboIds: [],
            },
        ],
    ]),
    flashes: new Map(),
    hes: new Map(),
    throwSpots: new Map([
        [
            "gNx6wmZRJX_dv",
            {
                id: "gNx6wmZRJX_dv",
                coords: { x: 25, y: 25 },
                toIds: [
                    "EOOfF3gTmzrL2",
                    "T81rq8FeVnKFg",
                    "q0ER3vmNRSe7a-9Zvyk",
                    "bozR5AccXBfmM",
                    "Bcn__DOHHfUT4",
                ],
                isSpecial: true,
            },
        ],
        [
            "c2ZW10Z85iese",
            {
                id: "c2ZW10Z85iese",
                coords: { x: 50, y: 50 },
                toIds: ["lRdZnqs18HiLW"],
                isSpecial: false,
            },
        ],
        [
            "BfHgp4IsQezko",
            {
                id: "BfHgp4IsQezko",
                coords: { x: 75, y: 75 },
                toIds: ["Ug5qL_LbcBY1k"],
                isSpecial: false,
            },
        ],
    ]),
};
