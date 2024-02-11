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
import type { ViewLinesHashMap } from "./ViewLinesHashMap";
import type { ViewThrowSpotsHashMap } from "./ViewThrowSpotsHashMap";

/* ### State machines */

/* ViewItems'es possible states */
// Новые ViewLine'ы и ViewThrowSpot'ы не имеют INACTIVE состояния,
// так как создаются при нажатии на `ViewLandSpot` и сразу же
// помещаются во viewThrowSpots уже в активном состоянии
type ViewLandSpotStateUnion =
    | "INACTIVE_UNSELECTED"
    | "ONLY_ACTIVE_MULTIPLE"
    | "ONLY_SELECTED_SINGLE"
    | "ONLY_SELECTED_MULTIPLE"
    | "ACTIVE_AND_SELECTED";
type ViewLineStateUnion = "UNSPOILED" | "ACTIVE" | "SELECTED" | "KILLED";
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
type ViewLineState = { value: ViewLineStateUnion };
type ViewThrowSpotState = { value: ViewThrowSpotStateUnion };
/* ViewItems'es Finite State Machines definitions */
type ViewLandSpotMachineObject = {
    [key in ViewLandSpotStateUnion]: Partial<
        Record<ViewItemEventType, (senderId: string) => void>
    >;
};
type ViewLineMachineObject = {
    [key in ViewLineStateUnion]: Partial<
        Record<ViewItemEventType, (senderId: string) => void>
    >;
};
type ViewThrowSpotMachineObject = {
    [key in ViewThrowSpotStateUnion]: Partial<
        Record<ViewItemEventType, (senderId: string) => void>
    >;
};

type ViewLandSpotEventUnion =
    | "viewLandSpotContacted"
    | "viewThrowSpotContacted"
    | "selfClicked";
type ViewLineEventUnion =
    | "viewLandSpotContacted"
    | "viewThrowSpotContacted"
    | "selfClicked";
type ViewFromSpotEventUnion =
    | "viewLandSpotContacted"
    | "viewThrowSpotContacted"
    | "selfClicked";
interface TransitionableViewLandSpot {
    $send: (event: ViewLandSpotEventUnion, senderId: string) => void;
    _setState: Function;
}
interface TransitionableViewLine {
    $send: (event: ViewLineEventUnion, senderId: string) => void;
    _setState: Function;
}
interface TransitionableViewThrowSpot {
    $send: (event: ViewFromSpotEventUnion, senderId: string) => void;
    _setState: Function;
}
interface ViewLandSpotStateMachine extends TransitionableViewLandSpot {
    context: {
        activeLines: Set<ViewLine>;
        selectedLines: Set<ViewLine>;
    };
    state: ViewLandSpotState;
    states: ViewLandSpotMachineObject;
}
interface ViewLineStateMachine extends TransitionableViewLine {
    context: {
        landSpot: Spot;
        throwSpot: Spot;
    };
    state: ViewLineState;
    states: ViewLineMachineObject;
}
interface ViewThrowSpotStateMachine extends TransitionableViewThrowSpot {
    context: {
        activeLines: Set<ViewLine>;
        selectedLines: Set<ViewLine>;
    };
    state: ViewThrowSpotState;
    states: ViewThrowSpotMachineObject;
}

/* ### Observers & Observables */
/* Interface to make a ViewItem class an Observer and Observable */
interface ViewLandSpotObservableObserver {
    $sendToDependencies: (
        event: ViewLandSpotEventUnion,
        senderId: string,
    ) => void;
}
interface ViewLineObservableObserver {
    $sendToDependencies: (event: ViewLineEventUnion, senderId: string) => void;
}
interface ViewThrowSpotObservableObserver {
    $sendToDependencies: (
        event: ViewThrowSpotStateUnion,
        senderId: string,
    ) => void;
}

// Позже убрать Ref с тех элементов, реактивность для которых не нужна,
// то есть с тех, значения которых не изменяются через "this." в методах.
export class ViewLandSpot
    implements ViewLandSpotStateMachine, ViewLandSpotObservableObserver
{
    readonly factory: ViewItemsFactory;
    landSpot: Spot;
    context: {
        activeLines: Set<ViewLine>;
        selectedLines: Set<ViewLine>;
    };
    state: ViewLandSpotState;
    states: ViewLandSpotMachineObject;
    observers: Set<ViewLine>;
    readonly lineupIds: Set<Lineup["lineupId"]>; // Используется для фильтрации
    readonly throwSpotIds: Set<Spot["spotId"]>;
    avgDuration: { value: string | null }; // Вычисляется при активации. Просто так.
    hslColor: { value: string | null }; // Вычисляется при активации. Чтобы 1й всегда был желтым

    constructor(landSpot: Spot, factory: ViewItemsFactory) {
        this.landSpot = landSpot;
        this.context = reactive({
            activeLines: new Set(),
            selectedLines: new Set(),
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
                    this.initializeHslColor();
                },
            },
            ONLY_ACTIVE_MULTIPLE: {
                selfClicked: () => {
                    this._setState("INACTIVE_UNSELECTED");
                    this.observers.forEach((observer) => {
                        const viewLine = this.factory.viewLines.value.get(
                            observer.lineup.lineupId,
                        )!;
                        this.context.activeLines.delete(viewLine);
                        observer.$send(
                            "viewLandSpotContacted",
                            this.landSpot.spotId,
                        );
                        this.observers.delete(observer); // Это может вызвать ошибку, будет здорово, если нет
                    });
                },
                viewThrowSpotContacted: (lineupId) => {
                    this._setState("ONLY_SELECTED_SINGLE");
                    const viewLine =
                        this.factory.viewLines.value.get(lineupId)!;
                    this.context.selectedLines.add(viewLine);
                    this._deleteAndDepopulateOwnDependencies({
                        except: [lineupId],
                    });
                    this.context.activeLines.clear();
                },
            },
            ONLY_SELECTED_SINGLE: {
                selfClicked: () => {
                    /* TODO */
                },
                viewThrowSpotContacted: (lineupId) => {
                    this._setState("ONLY_ACTIVE_MULTIPLE");
                    const viewLine =
                        this.factory.viewLines.value.get(lineupId)!;
                    this.context.selectedLines.delete(viewLine);
                    this.context.activeLines.add(viewLine);
                    this._createAndPopulateOwnDependencies({
                        except: [lineupId],
                    });
                    this.observers.forEach((observer) => {
                        if (observer.lineup.lineupId != lineupId)
                            /* Перевести их из UNSPOILED */
                            observer.$send(
                                "viewLandSpotContacted",
                                this.landSpot.spotId,
                            ); // вызывает подозрения, но вроде всё правильно
                    });
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
        this.throwSpotIds = new Set();
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
            const landSpot = this.factory.spots.get(lineup.landId)!;
            const throwSpot = this.factory.spots.get(lineup.throwId)!;

            /* Handle ViewLine creation */
            let viewLine = this.factory.viewLines.value.get(
                `${landSpot.spotId}<-${throwSpot.spotId}`,
            );
            if (!viewLine) {
                viewLine = new ViewLine(
                    lineup,
                    this.factory,
                    landSpot,
                    throwSpot,
                );
            }
            /* Add viewLine to observers of current ViewLandSpot */
            this.observers.add(viewLine);
            /* Add viewLine to activeLines */
            this.context.activeLines.add(viewLine);
            /* Add viewLine into ViewLines */
            this.factory.viewLines.value.set(lineup.lineupId, viewLine);

            /* Handle ViewThrowSpot creation */
            let viewThrowSpot = this.factory.viewThrowSpots.value.get(
                lineup.throwId,
            );
            if (!viewThrowSpot) {
                viewThrowSpot = new ViewThrowSpot(throwSpot, this.factory);
            }
            this.factory.viewThrowSpots.value.set(
                throwSpot.spotId,
                viewThrowSpot,
            );
        });
    }
    _deleteAndDepopulateOwnDependencies(
        options: { except: Lineup["lineupId"][] } = { except: [] },
    ) {
        this.observers.forEach((observer) => {
            if (!options.except.includes(observer.lineup.lineupId)) {
                const viewThrowSpot = this.factory.viewThrowSpots.value.get(
                    observer.lineup.throwId,
                )!;
                viewThrowSpot.context.activeLines.delete(observer);
                viewThrowSpot.observers.delete(observer);
                if (viewThrowSpot.state.value == "ONLY_ACTIVE_SINGLE") {
                    this.factory.viewThrowSpots.value.delete(
                        viewThrowSpot.throwSpot.spotId,
                    );
                }

                this.factory.viewLines.value.delete(observer.lineup.lineupId);

                this.observers.delete(observer);
            }
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

/* ViewLine Это не конкретный лайнап (хотя в большинстве случачев так и есть).
Это сущность, нужная только для отображения полоски на карте. 
О чем речь:
- в случае, если из одного throwSpot'а в один landSpot бросаются несколько
лайнапов (например smoke и he), то все эти лайнапы будут относиться только к одному
ViewLine'у.
В ином случае у нас было бы три разных ViewLineup'а, которые при клике по landSpot'у,
получали бы от него сообщение и каждый из них передавал бы throwSpot'у одно и то же
событие, которое заставляло бы этот throwSpot реагировать на событие от каждого из них,
хотя источник события (landSpot) посылал только одно событие (а не столько, сколько лайнапов). */
export class ViewLine
    implements ViewLineStateMachine, ViewLineObservableObserver
{
    readonly factory: ViewItemsFactory;
    lineId: `${Spot["spotId"]}<-${Spot["spotId"]}`; // `landId<-throwId`
    context: { landSpot: Spot; throwSpot: Spot; lineups: Lineup[] };
    state: ViewLineState;
    states: ViewLineMachineObject;
    constructor(
        lineup: Lineup,
        factory: ViewItemsFactory,
        landSpot: Spot,
        throwSpot: Spot,
    ) {
        this.lineId = `${landSpot.spotId}<-${throwSpot.spotId}`;
        this.context = {
            landSpot: landSpot,
            throwSpot: throwSpot,
            lineups: [lineup],
        };
        this.state = reactive<ViewLineState>({
            value: "UNSPOILED",
        });
        this.states = {
            UNSPOILED: {
                viewLandSpotContacted: (landSpotId) => {
                    this._setState("ACTIVE");
                    const lineupId = this.lineup.lineupId;
                    this.$sendToDependencies("viewLandSpotContacted", lineupId);
                    console.log(
                        "viewLine: viewLandSpotContacted; new state: ",
                        this.state.value,
                    );
                },
            },
            ACTIVE: {
                viewLandSpotContacted: (landSpotId) => {
                    this._setState("KILLED");
                    const lineupId = this.lineup.lineupId;
                    this.factory.viewLines.value.delete(lineupId);
                    this.$sendToDependencies("viewLandSpotContacted", lineupId);
                },
                viewThrowSpotContacted: (throwSpotId) => {
                    this._setState("SELECTED");
                    const lineupId = this.lineup.lineupId;
                    this.$sendToDependencies(
                        "viewThrowSpotContacted",
                        lineupId,
                    );
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
                        this.factory.viewLines.value.delete(lineupId);
                    }
                    this.$sendToDependencies(
                        "viewThrowSpotContacted",
                        lineupId,
                    );
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
    $sendToDependencies(event: ViewItemEventType, senderId: string) {
        if (event == "viewLandSpotContacted") {
            const viewThrowSpot = this.factory.viewThrowSpots.value.get(
                this.context.throwSpot.spotId,
            )!;
            viewThrowSpot.$send("viewLandSpotContacted", senderId);
        }
        if (event == "viewThrowSpotContacted") {
            const viewLandSpot = this.factory.viewLandSpots.value.get(
                this.context.landSpot.spotId,
            )!;
            viewLandSpot.$send("viewThrowSpotContacted", senderId);
        }
    }
    _setState(newState: ViewLineStateUnion) {
        this.state.value = newState;
    }
}

export class ViewThrowSpot
    implements ViewThrowSpotStateMachine, ViewThrowSpotObservableObserver
{
    readonly factory: ViewItemsFactory;
    throwSpot: Spot;
    context: {
        activeLines: Set<ViewLine>;
        selectedLines: Set<ViewLine>;
    };
    state: ViewThrowSpotState;
    states: ViewThrowSpotMachineObject;
    observers: Set<ViewLine>;
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
            activeLines: new Set(),
            selectedLines: new Set(),
        });
        this.state = reactive<ViewThrowSpotState>({
            value: "UNSPOILED",
        });
        this.states = {
            // ViewThrowSpot и ViewLine создаются извне в состояние UNSPOILED (при клике на ViewLandSpot)
            UNSPOILED: {
                viewLandSpotContacted: (lineupId) => {
                    console.log("viewFromSpot");
                    this._setState("ONLY_ACTIVE_SINGLE");
                    const viewLine =
                        this.factory.viewLines.value.get(lineupId)!;
                    this.observers.add(viewLine);
                    this.context.activeLines.add(viewLine);
                },
            },
            ONLY_ACTIVE_SINGLE: {
                selfClicked: () => {
                    this._setState("ONLY_SELECTED_SINGLE");
                    const viewLine = this.context.activeLines
                        .values()
                        .next().value;
                    this.context.activeLines.delete(viewLine);
                    this.context.selectedLines.add(viewLine);
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
                    const viewLine =
                        this.factory.viewLines.value.get(lineupId)!;
                    this.observers.delete(viewLine);
                    this.context.activeLines.delete(viewLine);
                    if (this.context.activeLines.size == 1) {
                        this._setState("ONLY_ACTIVE_SINGLE");
                    }
                },
            },
            ONLY_SELECTED_SINGLE: {
                selfClicked: () => {
                    const viewLine: ViewLine = this.context.selectedLines
                        .values()
                        .next().value;
                    const viewLandSpot = this.factory.viewLandSpots.value.get(
                        viewLine.lineup.landId,
                    )!;
                    const shouldReactivate =
                        viewLandSpot.state.value == "ACTIVE_AND_SELECTED" ||
                        viewLandSpot.state.value == "ONLY_SELECTED_SINGLE"; // TODO others
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
    viewLines: ViewLinesHashMap; // Reactive
    viewThrowSpots: ViewThrowSpotsHashMap; // Reactive
    constructor(
        spots: SpotsHashMap,
        lineups: LineupsHashMap,
        viewLandSpots: ViewLandSpotsHashMap, // Reactive
        viewLines: ViewLinesHashMap, // Reactive
        viewThrowSpots: ViewThrowSpotsHashMap, // Reactive
    ) {
        this.lineups = lineups;
        this.spots = spots;
        this.viewLandSpots = viewLandSpots;
        this.viewLines = viewLines;
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
