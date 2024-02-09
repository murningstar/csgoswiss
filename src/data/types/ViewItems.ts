/* СУПЕРВАЖНОЕ СООБЩЕНИЕ:
senderId для ViewLandSpot и ViewThrowSpot это всегда id лайнапа */

import { reactive, ref, type ComputedRef, type Ref, computed } from "vue";
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
import type { ViewLandSpotsHashMap } from "./ViewLandSpotsHashMap";
import type { ViewLineupsHashMap } from "./ViewLineupsHashMap";
import type { ViewThrowSpotsHashMap } from "./ViewThrowSpotsHashMap";

/* ### State machines */

/* ViewItems'es possible states */
// Новые ViewLineup'ы и ViewThrowSpot'ы не имеют INACTIVE состояния,
// так как создаются при нажатии на `ViewLandSpot` и сразу же
// помещаются во viewThrowSpots уже в активном состоянии
type ViewLandSpotStateUnion =
    | "INACTIVE_UNSELECTED"
    | "ONLY_ACTIVE_MULTIPLE"
    | "ONLY_SELECTED_SINGLE"
    | "ONLY_SELECTED_MULTIPLE"
    | "ACTIVE_AND_SELECTED";
type ViewLineupStateUnion = "UNSPOILED" | "ACTIVE" | "SELECTED" | "KILLED";
type ViewThrowSpotStateUnion =
    | "UNSPOILED"
    | "ONLY_ACTIVE_SINGLE"
    | "ONLY_ACTIVE_MULTIPLE"
    | "ONLY_SELECTED_SINGLE"
    | "ONLY_SELECTED_MULTIPLE"
    | "ACTIVE_AND_SELECTED"
    | "KILLED";
/* ViewItems'es state value (it's reactive) */
type ViewLandSpotState = { value: ViewLandSpotStateUnion };
type ViewLineupState = { value: ViewLineupStateUnion };
type ViewThrowSpotState = { value: ViewThrowSpotStateUnion };
/* ViewItems'es Finite State Machines definitions */
type ViewLandSpotMachineObject = {
    [key in ViewLandSpotStateUnion]: Partial<
        Record<ViewItemEventType, (senderId: string) => void>
    >;
};
type ViewLineupMachineObject = {
    [key in ViewLineupStateUnion]: Partial<
        Record<ViewItemEventType, (senderId: string) => void>
    >;
};
type ViewThrowSpotMachineObject = {
    [key in ViewThrowSpotStateUnion]: Partial<
        Record<ViewItemEventType, (senderId: string) => void>
    >;
};

type ViewItemEventType =
    | "viewLandSpotContacted"
    | "viewThrowSpotContacted"
    | "selfClicked";
interface StateMachineViewItem {
    $send: (event: ViewItemEventType, senderId: string) => void;
    _setState: Function;
}
interface ViewLandSpotStateMachine extends StateMachineViewItem {
    context: {
        activeLineups: Set<ViewLineup>;
        selectedLineups: Set<ViewLineup>;
    };
    state: ViewLandSpotState;
    states: ViewLandSpotMachineObject;
}
interface ViewLineupStateMachine extends StateMachineViewItem {
    context: {
        landSpot: Spot;
        throwSpot: Spot;
    };
    state: ViewLineupState;
    states: ViewLineupMachineObject;
}
interface ViewThrowSpotStateMachine extends StateMachineViewItem {
    context: {
        activeLineups: Set<ViewLineup>;
        selectedLineups: Set<ViewLineup>;
    };
    state: ViewThrowSpotState;
    states: ViewThrowSpotMachineObject;
}

/* ### Observers & Observables */
/* Interface to make a ViewItem class an Observer and Observable */
interface ViewItemObservableObserver {
    $sendToDependencies: (event: ViewItemEventType, senderId: string) => void;
}

// Позже убрать Ref с тех элементов, реактивность для которых не нужна,
// то есть с тех, значения которых не изменяются через "this." в методах.
export class ViewLandSpot
    implements ViewLandSpotStateMachine, ViewItemObservableObserver
{
    readonly factory: ViewItemsFactory;
    landSpot: Spot;
    context: {
        activeLineups: Set<ViewLineup>;
        selectedLineups: Set<ViewLineup>;
    };
    state: ViewLandSpotState;
    states: ViewLandSpotMachineObject;
    observers: Set<ViewLineup>;
    readonly lineupIds: Set<Lineup["lineupId"]>; // Используется для фильтрации
    avgDuration: { value: string | null }; // Вычисляется при активации. Просто так.
    hslColor: { value: string | null }; // Вычисляется при активации. Чтобы 1й всегда был желтым

    constructor(landSpot: Spot, factory: ViewItemsFactory) {
        this.landSpot = landSpot;
        this.context = reactive({
            activeLineups: new Set(),
            selectedLineups: new Set(),
        });
        this.state = reactive<ViewLandSpotState>({
            value: "INACTIVE_UNSELECTED",
        });
        this.states = {
            INACTIVE_UNSELECTED: {
                selfClicked: () => {
                    this._setState("ONLY_ACTIVE_MULTIPLE");
                    this._createAndPopulateOwnDependencies();
                    this.$sendToDependencies(
                        "viewLandSpotContacted",
                        this.landSpot.spotId,
                    );
                    this.initializeHslColor()
                },
            },
            ONLY_ACTIVE_MULTIPLE: {
                selfClicked: () => {
                    this._setState("INACTIVE_UNSELECTED");
                    this.observers.forEach((observer) => {
                        const viewLineup = this.factory.viewLineups.value.get(
                            observer.lineup.lineupId,
                        )!;
                        this.context.activeLineups.delete(viewLineup);
                        observer.$send(
                            "viewLandSpotContacted",
                            this.landSpot.spotId,
                        );
                        this.observers.delete(observer); // Это может вызвать ошибку, будет здорово, если нет
                    });
                },
                viewThrowSpotContacted: (lineupId) => {
                    this._setState("ONLY_SELECTED_SINGLE");
                    const viewLineup =
                        this.factory.viewLineups.value.get(lineupId)!;
                    this.context.selectedLineups.add(viewLineup);
                    this.context.activeLineups.clear();
                    this.observers.forEach((observer) => {
                        if (!(observer.lineup.lineupId == lineupId)) {
                            this.observers.delete(observer);
                        }
                    });
                },
            },
            ONLY_SELECTED_SINGLE: {
                selfClicked: () => {
                    /* TODO */
                },
                viewThrowSpotContacted: (lineupId) => {
                    this._setState("ONLY_ACTIVE_MULTIPLE");
                    const viewLineup =
                        this.factory.viewLineups.value.get(lineupId)!;
                    this.context.selectedLineups.delete(viewLineup);
                    this.context.activeLineups.add(viewLineup);
                    this._createAndPopulateOwnDependencies({
                        except: [lineupId],
                    });
                    this.$sendToDependencies(
                        "viewLandSpotContacted",
                        this.landSpot.spotId,
                    ); // вызывает подозрения, но вроде всё правильно
                },
            },
            ONLY_SELECTED_MULTIPLE: {
                /* TODO */
            },
            ACTIVE_AND_SELECTED: {
                /* TODO */
            },
        };
        this.observers = new Set();
        this.lineupIds = new Set();
        this.avgDuration = reactive({ value: "3.0" });
        this.hslColor = reactive({ value: null });
        this.factory = factory;
    }

    $send(event: ViewItemEventType, senderId: Spot["spotId"]) {
        const handler = this.states[this.state.value][event];
        if (handler) handler(senderId);
    }
    $sendToDependencies(event: ViewItemEventType, senderId: Spot["spotId"]) {
        this.observers.forEach((observer) => {
            observer.$send(event, senderId);
        });
    }
    /* When `this` (ViewLandSpot) transitions throw INACTIVE_UNSELECTED into ONLY_ACTIVE; */
    _createAndPopulateOwnDependencies(
        options: { except: Lineup["lineupId"][] } = { except: [] },
    ) {
        this.lineupIds.forEach((lineupId) => {
            if (options.except.includes(lineupId)) {
                /* Не обрабатывать этот lineupId (т.к. он уже обработан) */
                return;
            }
            const lineup = this.factory.lineups.get(lineupId)!;
            /* Handle ViewLineup creation */
            const viewLineup = new ViewLineup(
                lineup,
                this.factory,
                this.factory.spots.get(lineup.landId)!,
                this.factory.spots.get(lineup.throwId)!,
            );
            /* Add viewLineup to observers of current ViewLandSpot */
            this.observers.add(viewLineup);
            /* Add viewLineup to activeLineups */
            this.context.activeLineups.add(viewLineup);
            /* Add viewLineup into ViewLineups */
            this.factory.viewLineups.value.set(lineup.lineupId, viewLineup);

            /* Handle ViewThrowSpot creation */
            const throwSpot = this.factory.spots.get(lineup.throwId)!;
            let viewThrowSpot = this.factory.viewThrowSpots.value.get(
                lineup.throwId,
            );
            if (!viewThrowSpot) {
                viewThrowSpot = new ViewThrowSpot(throwSpot, this.factory);
            }
            this.factory.viewThrowSpots.value.set(throwSpot.spotId, viewThrowSpot);
        });
    }
    initializeHslColor() {
        let nonInactiveLandSpotsCount = 0;
        for (let viewLandSpot of this.factory.viewLandSpots.value.values()) {
            const isInactive =
                viewLandSpot.state.value == "INACTIVE_UNSELECTED";
            if (!isInactive) {
                nonInactiveLandSpotsCount++;
            }
        }
        this.hslColor.value =
            nonInactiveLandSpotsCount > 1
                ? (Math.random() * 359).toFixed(0)
                : "52";
    }
    _setState(newState: ViewLandSpotStateUnion) {
        this.state.value = newState;
    }
}

export class ViewLineup
    implements ViewLineupStateMachine, ViewItemObservableObserver
{
    readonly factory: ViewItemsFactory;
    lineup: Lineup;
    context: { landSpot: Spot; throwSpot: Spot };
    state: ViewLineupState;
    states: ViewLineupMachineObject;
    constructor(
        lineup: Lineup,
        factory: ViewItemsFactory,
        landSpot: Spot,
        throwSpot: Spot,
    ) {
        this.lineup = lineup;
        this.context = { landSpot: landSpot, throwSpot: throwSpot };
        this.state = reactive<ViewLineupState>({
            value: "UNSPOILED",
        });
        this.states = {
            UNSPOILED: {
                viewLandSpotContacted: (landSpotId) => {
                    this._setState("ACTIVE");
                    const lineupId = this.lineup.lineupId;
                    this.$sendToDependencies(
                        "viewLandSpotContacted",
                        lineupId,
                    );
                },
            },
            ACTIVE: {
                viewLandSpotContacted: (landSpotId) => {
                    this._setState("KILLED");
                    const lineupId = this.lineup.lineupId;
                    this.factory.viewLineups.value.delete(lineupId);
                    this.$sendToDependencies(
                        "viewLandSpotContacted",
                        lineupId,
                    );
                },
                viewThrowSpotContacted: (throwSpotId) => {
                    this._setState("SELECTED");
                    const lineupId = this.lineup.lineupId;
                    this.$sendToDependencies("viewThrowSpotContacted", lineupId);
                },
            },
            SELECTED: {
                viewLandSpotContacted: (landSpotId) => {
                    /* TODO */
                },
                viewThrowSpotContacted: (throwSpotId) => {
                    const lineupId = this.lineup.lineupId;
                    const landId = this.lineup.landId;
                    const viewLandSpot =
                        this.factory.viewLandSpots.value.get(landId)!;
                    const shouldReactivate =
                        viewLandSpot.state.value == "ACTIVE_AND_SELECTED" ||
                        viewLandSpot.state.value == "ONLY_SELECTED_SINGLE";
                    if (shouldReactivate) {
                        this._setState("ACTIVE");
                    } else {
                        this._setState("KILLED");
                        this.factory.viewLineups.value.delete(lineupId);
                    }
                    this.$sendToDependencies("viewThrowSpotContacted", lineupId);
                },
            },
            KILLED: {},
        };
        this.factory = factory;
    }
    $send(event: ViewItemEventType, senderId: string) {
        const handler = this.states[this.state.value][event];
        if (handler) handler(senderId);
    }
    $sendToDependencies(event: ViewItemEventType, senderId: string) {}
    _setState(newState: ViewLineupStateUnion) {
        this.state.value = newState;
    }
}

export class ViewThrowSpot
    implements ViewThrowSpotStateMachine, ViewItemObservableObserver
{
    readonly factory: ViewItemsFactory;
    throwSpot: Spot;
    context: {
        activeLineups: Set<ViewLineup>;
        selectedLineups: Set<ViewLineup>;
    };
    state: ViewThrowSpotState;
    states: ViewThrowSpotMachineObject;
    observers: Set<ViewLineup>;
    constructor(
        throwSpot: Spot,
        // lineupIds: Lineup["lineupId"][];
        /* state: ViewThrowSpotState // Возможно нужно будет принимать нужный стейт для
        1) Создании при клике на ViewLandSpot
        2) Инициализации выбранных лайнапов из url'а (в onMounted) */
        factory: ViewItemsFactory,
    ) {
        this.throwSpot = throwSpot;
        // this.lineupIds = argObj.lineupIds;
        this.context = reactive({
            activeLineups: new Set(),
            selectedLineups: new Set(),
        });
        this.state = reactive<ViewThrowSpotState>({
            value: "UNSPOILED",
        });
        this.states = {
            // ViewThrowSpot и ViewLineup создаются извне в состояние UNSPOILED (при клике на ViewLandSpot)
            UNSPOILED: {
                viewLandSpotContacted: (lineupId) => {
                    this._setState("ONLY_ACTIVE_SINGLE");
                    const viewLineup =
                        this.factory.viewLineups.value.get(lineupId)!;
                    this.observers.add(viewLineup);
                    this.context.activeLineups.add(viewLineup);
                },
            },
            ONLY_ACTIVE_SINGLE: {
                selfClicked: () => {
                    this._setState("ONLY_SELECTED_SINGLE");
                    const viewLineup = this.context.activeLineups
                        .values()
                        .next().value;
                    this.context.activeLineups.delete(viewLineup);
                    this.context.selectedLineups.add(viewLineup);
                    this.$sendToDependencies(
                        "viewThrowSpotContacted",
                        this.throwSpot.spotId,
                    );
                },
                viewLandSpotContacted: (lineupId) => {
                    // Если что-то не будет работать, возможно нужно глянуть сюда
                    this._setState("KILLED");
                    this.factory.viewThrowSpots.value.delete(
                        this.throwSpot.spotId,
                    );
                },
            },
            ONLY_ACTIVE_MULTIPLE: {
                selfClicked: () => {
                    /* ⚡TODO: SelectForm */
                },
                viewLandSpotContacted: (lineupId) => {
                    const viewLineup =
                        this.factory.viewLineups.value.get(lineupId)!;
                    this.observers.delete(viewLineup);
                    this.context.activeLineups.delete(viewLineup);
                    if (this.context.activeLineups.size == 1) {
                        this._setState("ONLY_ACTIVE_SINGLE");
                    }
                },
            },
            ONLY_SELECTED_SINGLE: {
                selfClicked: () => {
                    const viewLineup: ViewLineup = this.context.selectedLineups
                        .values()
                        .next().value;
                    const viewLandSpot = this.factory.viewLandSpots.value.get(
                        viewLineup.lineup.landId,
                    )!;
                    const shouldReactivate =
                        viewLandSpot.state.value == "ACTIVE_AND_SELECTED" ||
                        viewLandSpot.state.value == "ONLY_SELECTED_SINGLE"; // TODO
                    if (shouldReactivate) {
                        this._setState("ONLY_ACTIVE_SINGLE");
                    } else {
                        this._setState("KILLED");
                        this.factory.viewThrowSpots.value.delete(
                            this.throwSpot.spotId,
                        );
                    }
                    this.$sendToDependencies(
                        "viewThrowSpotContacted",
                        this.throwSpot.spotId,
                    );
                },
                viewLandSpotContacted: (lineupId) => {
                    /* TODO */
                },
            },
            ONLY_SELECTED_MULTIPLE: {
                selfClicked: () => {
                    /* ⚡TODO: SelectForm */
                },
                viewLandSpotContacted: (lineupId) => {
                    /* TODO */
                },
            },
            ACTIVE_AND_SELECTED: {
                selfClicked: () => {
                    /* ⚡TODO: SelectForm */
                },
                viewLandSpotContacted: (lineupId) => {
                    /* TODO */
                },
            },
            KILLED: {},
        };
        this.observers = new Set();
        this.factory = factory;
    }
    $send(event: ViewItemEventType, senderId: string) {
        const handler = this.states[this.state.value][event];
        if (handler) handler(senderId);
    }
    $sendToDependencies(event: ViewItemEventType, senderId: string) {
        this.observers.forEach((observer) => {
            observer.$send(event, senderId);
        });
    }
    _setState(newState: ViewThrowSpotStateUnion) {
        this.state.value = newState;
    }
}

export class ViewItemsFactory {
    readonly lineups: Map<Lineup["lineupId"], Lineup>;
    readonly spots: Map<Spot["spotId"], Spot>;
    readonly lineupIdNameMap: Map<string, string>;
    viewLandSpots: ViewLandSpotsHashMap; // Reactive
    viewLineups: ViewLineupsHashMap; // Reactive
    viewThrowSpots: ViewThrowSpotsHashMap; // Reactive
    constructor(
        spots: SpotsHashMap,
        lineups: LineupsHashMap,
        viewLandSpots: ViewLandSpotsHashMap, // Reactive
        viewLineups: ViewLineupsHashMap, // Reactive
        viewThrowSpots: ViewThrowSpotsHashMap, // Reactive
    ) {
        this.lineups = lineups;
        this.spots = spots;
        this.viewLandSpots = viewLandSpots;
        this.viewLineups = viewLineups;
        this.viewThrowSpots = viewThrowSpots;
        this.lineupIdNameMap = new Map<string, string>();
        this.lineups.forEach((lineup, lineupId) => {
            this.lineupIdNameMap.set(lineup.name, lineupId);
        });
    }
    createViewLandSpots() {
        const viewLandSpots: ViewLandSpotsHashMap = { value: new Map() };
        // populate `viewLandSpots` hashmap
        this.lineups.forEach((lineup) => {
            const { landId } = lineup;
            if (!viewLandSpots.value.has(landId)) {
                const landSpot = this.spots.get(landId)!;
                const viewLandSpot = new ViewLandSpot(landSpot, this);
                viewLandSpots.value.set(landId, viewLandSpot);
            }
        });
        // fill `lineupIds[]` for each viewLandSpot
        this.lineups.forEach((lineup) => {
            const { landId } = lineup;
            const viewLandSpot = viewLandSpots.value.get(landId)!;
            viewLandSpot.lineupIds.add(lineup.lineupId);
        });
        return viewLandSpots;
    }
    createActiveViewThrowSpot(lineupId: string): ViewThrowSpot {
        const lineup = this.lineups.get(lineupId)!;
        const viewThrowSpot = new ViewThrowSpot({
            throwSpot: this.spots.get(lineup.throwId)!,
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
            activatedBylandSpotIds: [lineup.landId],
            selectedBylandSpotIds: [],
        });
        viewThrowSpot.filter.nadeType[lineup.nadeType]++;
        viewThrowSpot.filter.difficulties[lineup.difficulty]++;
        viewThrowSpot.filter.side[lineup.side]++;
        viewThrowSpot.filter.tickrate[lineup.tickrate]++;
        return viewThrowSpot;
    }
    getLineupByName(name: string): Lineup {
        const id = this.lineupIdNameMap.get(name)!;
        return this.lineups.get(id)!;
    }
}
