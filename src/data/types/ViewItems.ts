import type { ComputedRef, Ref } from "vue";
import type { Lineup } from "../interfaces/Lineup";
import type { Spot } from "../interfaces/Spot";
import type {
    NadeType,
    Side,
    Tickrate,
    Difficulty,
    ViewCountNadeType,
    ViewCountSide,
    ViewCountTickrate,
    ViewCountDifficulty,
} from "./GrenadeProperties";
import type { MapItems } from "@/data/types/MapItems";
import { boolean } from "zod";

export type LineupItem = {
    lineup: Lineup;
    isActive: boolean;
    isSelected: boolean;
};

export class ViewToSpot {
    toSpot: Spot;
    filter: {
        nadeType: ViewCountNadeType;
        side: ViewCountSide;
        tickrate: ViewCountTickrate;
        difficulties: ViewCountDifficulty;
    };
    lineupIds: Lineup["lineupId"][];
    throwSpotIds: string[];
    avgDuration: string | undefined; // Вычисляется при активации. Просто так.
    hslColor: string | undefined; // Вычисляется при активации. Чтобы 1й всегда был желтым
    isActive: boolean;
    isSelected: boolean;
    // observers: Array<LineupItem | FromSpotItem>;
    activeLineupIds: Set<Lineup["lineupId"]>;
    selectedLineupIds: Set<Lineup["lineupId"]>;
    activeFromSpotIds: Spot["spotId"][];
    selectedFromSpotIds: Spot["spotId"][];

    constructor(
        toSpot: Spot,
        filter: {
            nadeType: ViewCountNadeType;
            side: ViewCountSide;
            tickrate: ViewCountTickrate;
            difficulties: ViewCountDifficulty;
        },
        lineupIds: Lineup["lineupId"][],
        avgDuration?: string,
        hslColor?: string,
        isActive = false,
        isSelected = false,
        activeLineupIds = new Set<Lineup["lineupId"]>(),
        selectedLineupIds = new Set<Lineup["lineupId"]>(),
        activeFromSpotIds = [],
        selectedFromSpotIds = []
    ) {
        this.toSpot = toSpot;
        this.filter = filter;
        this.lineupIds = lineupIds;
        this.throwSpotIds = [];
        this.avgDuration = avgDuration;
        this.hslColor = hslColor;
        this.isActive = isActive;
        this.isSelected = isSelected;
        this.activeLineupIds = activeLineupIds;
        this.selectedLineupIds = selectedLineupIds;
        this.activeFromSpotIds = activeFromSpotIds;
        this.selectedFromSpotIds = selectedFromSpotIds;
    }

    /*         onClick({ 
        activeCounterRef 
    } : { 
        activeCounterRef: Ref<number> 
    }) {
        if (!this.isActive) {
            this.activate(activeCounterRef);
        }
        if (this.isActive) {
            this.deactivate(activeCounterRef);
        }
    }

    activate(activeCounterRef: Ref<number>) {
        if (!this.isSelected) {
            activeCounterRef.value++;
            this.isActive=true
            this.lineupIds.forEach(lineupId=>)
        }
        if (this.isSelected) {
            
        }
    }

    deactivate(activeCounterRef: Ref<number>) {
        if (!this.isSelected){
            activeCounterRef.value--
            this.isActive=false
        }
        if (this.isSelected){

        }
    } */
    getNonSelectedLineupIds() {
        return this.lineupIds.filter(
            (lineupId) => !this.selectedLineupIds.has(lineupId)
        );
    }
}

export class ViewFromSpot {
    fromSpot: Spot;
    lineupIds: Lineup["lineupId"][];
    filter: {
        nadeType: ViewCountNadeType;
        side: ViewCountSide;
        tickrate: ViewCountTickrate;
        difficulties: ViewCountDifficulty;
    };
    isActive: boolean;
    isSelected: boolean;
    activeLineupIds: Set<Lineup["lineupId"]>;
    selectedLineupIds: Set<Lineup["lineupId"]>;
    activatedByToSpotIds: Spot["spotId"][];
    selectedByToSpotIds: Spot["spotId"][];

    constructor(argObj: {
        fromSpot: Spot;
        lineupIds: Lineup["lineupId"][];
        filter: {
            nadeType: ViewCountNadeType;
            side: ViewCountSide;
            tickrate: ViewCountTickrate;
            difficulties: ViewCountDifficulty;
        };
        isActive: boolean;
        isSelected: boolean;
        activeLineupIds: Set<Lineup["lineupId"]>;
        selectedLineupIds: Set<Lineup["lineupId"]>;
        activatedByToSpotIds: Spot["spotId"][];
        selectedByToSpotIds: Spot["spotId"][];
    }) {
        this.fromSpot = argObj.fromSpot;
        this.lineupIds = argObj.lineupIds;
        this.filter = argObj.filter;
        this.isActive = argObj.isActive;
        this.isSelected = argObj.isSelected;
        this.activeLineupIds = argObj.activeLineupIds;
        this.selectedLineupIds = argObj.selectedLineupIds;
        this.activatedByToSpotIds = argObj.activatedByToSpotIds;
        this.selectedByToSpotIds = argObj.selectedByToSpotIds;
    }
    getActiveWithoutSelected() {}
}

export class ViewItemsFactory {
    readonly lineups: Map<Lineup["lineupId"], Lineup>;
    readonly spots: Map<Spot["spotId"], Spot>;
    readonly lineupIdNameMap: Map<string, string>;
    constructor(mapItems: MapItems) {
        this.lineups = mapItems.lineups;
        this.spots = mapItems.spots;
        this.lineupIdNameMap = new Map<string, string>();
        this.lineups.forEach((lineup, lineupId) => {
            this.lineupIdNameMap.set(lineup.name, lineupId);
        });
    }
    generateViewToSpots() {
        const viewToSpotsCollection: Map<Spot["spotId"], ViewToSpot> =
            new Map();
        this.lineups.forEach((lineup) => {
            if (!viewToSpotsCollection.has(lineup.toId)) {
                /* Если toSpot'а из лайнапа на текущей итерации нет, то создаем */
                const toSpot = this.spots.get(lineup.toId)!;
                const newViewToSpot = new ViewToSpot(
                    toSpot,
                    {
                        nadeType: {
                            smoke: 0,
                            molotov: 0,
                            flash: 0,
                            he: 0,
                        } as ViewCountNadeType,
                        side: {
                            ct: 0,
                            t: 0,
                        } as ViewCountSide,
                        tickrate: {
                            "64": 0,
                            "128": 0,
                        } as ViewCountTickrate,
                        difficulties: {
                            easy: 0,
                            medium: 0,
                            hard: 0,
                            pixelPerfect: 0,
                        } as ViewCountDifficulty,
                        // onewaySmokeOption:[], fakeSmokeOption:[], bugSmokeOption:[], forWhom:[], onewayMolotovOption:[], fakeMolotovOption:[], bugMolotovOption:[], bugHeOption:[],
                    },
                    [lineup.lineupId]
                );
                newViewToSpot.filter.nadeType[lineup.nadeType]++;
                newViewToSpot.filter.difficulties[lineup.difficulty]++;
                newViewToSpot.filter.side[lineup.side]++;
                newViewToSpot.filter.tickrate[lineup.tickrate]++;
                viewToSpotsCollection.set(lineup.toId, newViewToSpot);
            } else {
                /* Если toSpot уже есть, то добавляем в него данные из текущего лайнапа */
                const toSpot = viewToSpotsCollection.get(lineup.toId)!;
                toSpot.lineupIds.push(lineup.lineupId);
                toSpot.filter.nadeType[lineup.nadeType]++;
                toSpot.filter.side[lineup.side]++;
                toSpot.filter.tickrate[lineup.tickrate]++;
                toSpot.filter.difficulties[lineup.difficulty]++;
                viewToSpotsCollection.set(lineup.toId, toSpot);
            }
        });
        return viewToSpotsCollection;
    }
    createViewLineup(lineupId: string): LineupItem {
        const viewLineupItem: LineupItem = {
            lineup: this.lineups.get(lineupId)!,
            isActive: false,
            isSelected: false,
        };
        return viewLineupItem;
    }
    createActiveViewFromSpot(lineupId: string): ViewFromSpot {
        const lineup = this.lineups.get(lineupId)!;
        const viewFromSpot = new ViewFromSpot({
            fromSpot: this.spots.get(lineup.fromId)!,
            lineupIds: [lineupId],
            filter: {
                nadeType: {
                    smoke: 0,
                    molotov: 0,
                    flash: 0,
                    he: 0,
                } as ViewCountNadeType,
                side: {
                    ct: 0,
                    t: 0,
                } as ViewCountSide,
                tickrate: {
                    "64": 0,
                    "128": 0,
                } as ViewCountTickrate,
                difficulties: {
                    easy: 0,
                    medium: 0,
                    hard: 0,
                    pixelPerfect: 0,
                } as ViewCountDifficulty,
            },
            isActive: true,
            isSelected: false,
            activeLineupIds: new Set<Lineup["lineupId"]>().add(lineupId),
            selectedLineupIds: new Set<Lineup["lineupId"]>(),
            activatedByToSpotIds: [lineup.toId],
            selectedByToSpotIds: [],
        });
        viewFromSpot.filter.nadeType[lineup.nadeType]++;
        viewFromSpot.filter.difficulties[lineup.difficulty]++;
        viewFromSpot.filter.side[lineup.side]++;
        viewFromSpot.filter.tickrate[lineup.tickrate]++;
        return viewFromSpot;
    }
    getLineupByName(name: string): Lineup {
        const id = this.lineupIdNameMap.get(name)!;
        return this.lineups.get(id)!
    }
}
