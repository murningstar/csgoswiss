import { reactive, ref, type Ref } from "vue";
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
import type { SpotsHashMap } from "./SpotsHashMap";
import type { LineupsHashMap } from "./LineupsHashMap";
import type { ViewToSpotsHashMap } from "./ViewToSpotsHashMap";
import type { LineupItemsHashMap } from "./LineupItemsHashMap";
import type { ViewFromSpotsHashMap } from "./ViewFromSpotsHashMap";

/* ### State machines */

/* ViewItems'es possible states */
// Новые ViewLineup'ы и ViewFromSpot'ы не имеют INACTIVE состояния,
// так как создаются при нажатии на `ViewToSpot` и сразу же
// помещаются во viewFromSpots уже в активном состоянии
type ViewToSpotStateUnion =
    | "INACTIVE_UNSELECTED"
    | "ONLY_ACTIVE_SINGLE"
    | "ONLY_ACTIVE_MULTIPLE"
    | "ONLY_SELECTED_SINGLE"
    | "ONLY_SELECTED_MULTIPLE"
    | "ACTIVE_AND_SELECTED";
type ViewLineupStateUnion = "DEAD" | "ACTIVE" | "SELECTED";
type ViewFromSpotStateUnion =
    | "DEAD"
    | "ONLY_ACTIVE_SINGLE"
    | "ONLY_ACTIVE_MULTIPLE"
    | "ONLY_SELECTED_SINGLE"
    | "ONLY_SELECTED_MULTIPLE"
    | "ACTIVE_AND_SELECTED";
/* ViewItems'es state value (it's reactive) */
type ViewToSpotState = { value: ViewToSpotStateUnion };
type ViewLineupState = { value: ViewLineupStateUnion };
type ViewFromSpotState = { value: ViewFromSpotStateUnion };
/* ViewItems'es Finite State Machines definitions */
type ViewToSpotMachineObject = {
    [key in ViewToSpotStateUnion]: Partial<Record<ViewItemEventType, Function>>;
};
type ViewLineupMachineObject = {
    [key in ViewLineupStateUnion]: Partial<Record<ViewItemEventType, Function>>;
};
type ViewFromSpotMachineObject = {
    [key in ViewFromSpotStateUnion]: Partial<
        Record<ViewItemEventType, Function>
    >;
};

type ViewItemEventType =
    | "viewToSpotClicked"
    | "viewFromSpotClicked"
    | "selfClicked";
interface StateMachineViewItem {
    $send: (event: ViewItemEventType) => void;
    _setState: Function;
}
interface ViewToSpotStateMachine extends StateMachineViewItem {
    context: {
        activeLineups: Set<ViewLineup>;
        selectedLineups: Set<ViewLineup>;
    };
    state: ViewToSpotState;
    states: ViewToSpotMachineObject;
}
interface ViewLineupStateMachine extends StateMachineViewItem {
    context: {};
    state: ViewLineupState;
    states: ViewLineupMachineObject;
}
interface ViewFromSpotStateMachine extends StateMachineViewItem {
    context: {
        activeLineups: Set<ViewLineup>;
        selectedLineups: Set<ViewLineup>;
    };
    state: ViewFromSpotState;
    states: ViewFromSpotMachineObject;
}

/* ### Observers & Observables */

/* ViewItem message handler function type */
type ViewItemMessageHandler = (
    id: Spot["spotId"] | Lineup["lineupId"],
    event: ViewItemEventType,
) => void;
/* Interface to make class an Observer and Observable */
interface ViewItemObservableObserver {
    notifyDependencies: ViewItemMessageHandler;
    getNotified: ViewItemMessageHandler;
}

// Позже убрать Ref с тех элементов, реактивность для которых не нужна,
// то есть с тех, значения которых не изменяются через "this." в методах.
export class ViewToSpot
    implements ViewToSpotStateMachine, ViewItemObservableObserver
{
    readonly factory: ViewItemsFactory;
    toSpot: Spot;
    context: {
        activeLineups: Set<ViewLineup>;
        selectedLineups: Set<ViewLineup>;
    };
    state: ViewToSpotState;
    states: ViewToSpotMachineObject;
    observers: Set<ViewLineup>;
    readonly lineupIds: Set<Lineup["lineupId"]>; // Используется для фильтрации
    avgDuration: string | undefined; // Вычисляется при активации. Просто так.
    hslColor: string | undefined; // Вычисляется при активации. Чтобы 1й всегда был желтым

    constructor(
        toSpot: Spot,
        factory: ViewItemsFactory,
        avgDuration?: string,
        hslColor?: string,
    ) {
        this.toSpot = toSpot;
        this.context = reactive({
            activeLineups: new Set(),
            selectedLineups: new Set(),
        });
        this.state = reactive<ViewToSpotState>({
            value: "INACTIVE_UNSELECTED",
        });
        this.states = {
            INACTIVE_UNSELECTED: {
                selfClicked: () => {
                    this._setState("ONLY_ACTIVE_SINGLE");
                    this._createAndPopulateOwnDependencies();
                    this.notifyDependencies();
                    // trigger observers
                },
            },
            ONLY_ACTIVE_SINGLE: {
                selfClicked: () => {},
            },
            ONLY_ACTIVE_MULTIPLE: {
                selfClicked: () => {},
            },
            ONLY_SELECTED_SINGLE: {
                selfClicked: () => {},
            },
            ONLY_SELECTED_MULTIPLE: {
                selfClicked: () => {},
            },
            ACTIVE_AND_SELECTED: {
                selfClicked: () => {},
            },
        };
        this.observers = new Set();
        this.lineupIds = new Set();
        this.avgDuration = avgDuration;
        this.hslColor = hslColor;
        this.factory = factory;
    }

    $send(event: ViewItemEventType) {
        const handler = this.states[this.state.value][event];
        if (handler) handler();
    }
    /* When `this` (or viewToSpot) transitions INACTIVE_UNSELECTED -> ONLY_ACTIVE; */
    _createAndPopulateOwnDependencies() {
        this.lineupIds.forEach((lineupId) => {
            const viewLineup = this.factory.createViewLineup(lineupId);
            const alreadyExists = this.factory.viewFromSpots.value.has(
                viewLineup.lineup.fromId,
            );
            if (!alreadyExists) {
                const viewFromSpot = this.factory.createViewFromSpot("..."); // СОЗДАТЬ VIEWTOSPOT ТЕПЕРь
                // this.factory.viewFromSpots.value.set()
            }
            this.observers.add(viewLineup);
            // this.factory.viewLineups.value.set()
        });
    }
    notifyDependencies(id: Spot["spotId"], event: ViewItemEventType) {
        this.observers.forEach((observer) => {
            observer.getNotified(id, event);
        });
    }
    getNotified(id: string, event: ViewItemEventType) {}
    _setState(newState: ViewToSpotStateUnion) {
        this.state.value = newState;
    }
}

export class ViewLineup
    implements ViewLineupStateMachine, ViewItemObservableObserver
{
    readonly factory: ViewItemsFactory;
    lineup: Lineup;
    context: {};
    state: ViewLineupState;
    states: ViewLineupMachineObject;
    constructor(lineup: Lineup, factory: ViewItemsFactory) {
        this.lineup = lineup;
        this.context = {};
        this.state = reactive<ViewLineupState>({
            value: "DEAD",
        });
        this.states = {
            DEAD: {},
            ACTIVE: {},
            SELECTED: {},
        };
        this.factory = factory;
    }
    $send(event: ViewItemEventType) {
        const handler = this.states[this.state.value][event];
        if (handler) handler();
    }
    _setState(newState: ViewFromSpotStateUnion) {
        this.state.value = newState;
    }
    getNotified(id: string, event: ViewItemEventType) {
        if (event == "viewToSpotClicked") this.$send("viewToSpotClicked");
        if (event == "viewFromSpotClicked") this.$send("viewFromSpotClicked");
    }
    notifyDependencies(id: string, event: ViewItemEventType) {}
}

export class ViewFromSpot
    implements ViewFromSpotStateMachine, ViewItemObservableObserver
{
    readonly factory: ViewItemsFactory;
    fromSpot: Spot;
    context: {
        activeLineups: Set<ViewLineup>;
        selectedLineups: Set<ViewLineup>;
    };
    state: ViewFromSpotState;
    states: ViewFromSpotMachineObject;
    observers: Set<ViewLineup>;
    readonly lineupIds: Set<Lineup["lineupId"]>;
    constructor(
        fromSpot: Spot,
        // lineupIds: Lineup["lineupId"][];
        /* state: ViewFromSpotState // Возможно нужно будет принимать нужный стейт для
        1) Создании при клике на ViewToSpot
        2) Инициализации выбранных лайнапов из url'а (в onMounted) */
        factory: ViewItemsFactory,
    ) {
        this.fromSpot = fromSpot;
        // this.lineupIds = argObj.lineupIds;
        this.context = reactive({
            activeLineups: new Set(),
            selectedLineups: new Set(),
        });
        this.state = reactive<ViewFromSpotState>({
            value: "DEAD",
        });
        this.states = {
            DEAD: {}, // ViewFromSpot создается только извне (при клике на ViewToSpot)
            ONLY_ACTIVE_SINGLE: {
                selfClicked: () => {
                    this._setState("DEAD");
                    const id = this.fromSpot.spotId;
                    this.notifyDependencies(id, "");
                },
            },
            ONLY_ACTIVE_MULTIPLE: {
                selfClicked: () => {},
            },
            ONLY_SELECTED_SINGLE: {
                selfClicked: () => {},
            },
            ONLY_SELECTED_MULTIPLE: {
                selfClicked: () => {},
            },
            ACTIVE_AND_SELECTED: {
                selfClicked: () => {},
            },
        };
        this.observers = new Set();
        this.factory = factory;
    }
    notifyDependencies(id: string, event: ViewItemEventType) {
        this.observers.forEach((observer) => {
            observer.getNotified(event, this);
        });
    }
    getNotified(id: string, event: ViewItemEventType) {}
    $send(event: ViewItemEventType) {
        const handler = this.states[this.state.value][event];
        if (handler) handler();
    }
    _setState(newState: ViewFromSpotStateUnion) {
        this.state.value = newState;
    }
}

export class ViewItemsFactory {
    readonly lineups: Map<Lineup["lineupId"], Lineup>;
    readonly spots: Map<Spot["spotId"], Spot>;
    readonly lineupIdNameMap: Map<string, string>;
    viewToSpots: ViewToSpotsHashMap; // Reactive
    viewLineups: LineupItemsHashMap; // Reactive
    viewFromSpots: ViewFromSpotsHashMap; // Reactive
    constructor(
        spots: SpotsHashMap,
        lineups: LineupsHashMap,
        viewToSpots: ViewToSpotsHashMap, // Reactive
        viewLineups: LineupItemsHashMap, // Reactive
        viewFromSpots: ViewFromSpotsHashMap, // Reactive
    ) {
        this.lineups = lineups;
        this.spots = spots;
        this.viewToSpots = viewToSpots;
        this.viewLineups = viewLineups;
        this.viewFromSpots = viewFromSpots;
        this.lineupIdNameMap = new Map<string, string>();
        this.lineups.forEach((lineup, lineupId) => {
            this.lineupIdNameMap.set(lineup.name, lineupId);
        });
    }
    createViewToSpots() {
        const viewToSpots: ViewToSpotsHashMap = { value: new Map() };
        // populate `viewToSpots` hashmap
        this.lineups.forEach((lineup) => {
            const { toId } = lineup;
            if (!viewToSpots.value.has(toId)) {
                const toSpot = this.spots.get(toId)!;
                const viewToSpot = new ViewToSpot(toSpot, this);
                viewToSpots.value.set(toId, viewToSpot);
            }
        });
        // fill `lineupIds[]` for each viewToSpot
        this.lineups.forEach((lineup) => {
            const { toId } = lineup;
            const viewToSpot = viewToSpots.value.get(toId)!;
            viewToSpot.lineupIds.add(lineup.lineupId);
        });
        return viewToSpots;
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
        return this.lineups.get(id)!;
    }
}
