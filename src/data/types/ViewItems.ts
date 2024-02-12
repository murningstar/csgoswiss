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
type ViewLineStateUnion =
    | "CREATED"
    | "ONLY_ACTIVE_SINGLE"
    | "ONLY_ACTIVE_MULTIPLE"
    | "ONLY_SELECTED_SINGLE"
    | "ONLY_SELECTED_MULTIPLE"
    | "ACTIVE_AND_SELECTED"
    | "KILLED";
type ViewThrowSpotStateUnion =
    | "CREATED"
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
    state: ViewLandSpotState;
    states: ViewLandSpotMachineObject;
}
interface ViewLineStateMachine extends TransitionableViewLine {
    context: { activeLineups: Set<Lineup>; selectedLineups: Set<Lineup> };
    state: ViewLineState;
    states: ViewLineMachineObject;
}
interface ViewThrowSpotStateMachine extends TransitionableViewThrowSpot {
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

type LineId = `${Spot["spotId"]}<-${Spot["spotId"]}`;

// Позже убрать Ref с тех элементов, реактивность для которых не нужна,
// то есть с тех, значения которых не изменяются через "this." в методах.
export class ViewLandSpot
    implements ViewLandSpotStateMachine, ViewLandSpotObservableObserver
{
    readonly factory: ViewItemsFactory;
    landSpot: Spot;
    state: ViewLandSpotState;
    states: ViewLandSpotMachineObject;
    observers: Set<ViewLine>;
    readonly lineups: Set<Lineup>; // Используется для фильтрации
    readonly throwSpots: Set<Spot>;
    avgDuration: { value: string | null }; // Вычисляется при активации. Просто так.
    hslColor: { value: string | null }; // Вычисляется при активации. Чтобы 1й всегда был желтым

    constructor(landSpot: Spot, factory: ViewItemsFactory) {
        this.landSpot = landSpot;
        this.state = reactive<ViewLandSpotState>({
            value: "INACTIVE_UNSELECTED",
        });
        this.states = {
            INACTIVE_UNSELECTED: {
                selfClicked: () => {
                    this._setState("ONLY_ACTIVE_MULTIPLE");
                    this._createAndPopulateOwnDependencies();
                    this.$sendToDependencies(
                        "getPopulated",
                        this.landSpot.spotId,
                    );
                    this.initializeHslColor();
                },
            },
            ONLY_ACTIVE_MULTIPLE: {
                selfClicked: () => {
                    this._setState("INACTIVE_UNSELECTED");
                    this.observers.forEach((observer) => {
                        observer.$send(
                            "viewLandSpotContacted",
                            this.landSpot.spotId,
                        );
                        this.observers.delete(observer); // Это может вызвать ошибку, будет здорово, если нет
                    });
                },
                viewThrowSpotContacted: (lineId) => {
                    this._setState("ONLY_SELECTED_SINGLE");
                    const viewLine = this.factory.viewLines.value.get(
                        lineId as LineId,
                    )!;
                    this._deleteAndDepopulateOwnDependencies({
                        except: [viewLine],
                    });
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
                    this._createAndPopulateOwnDependencies();
                    this.observers.forEach((observer) => {
                        if (observer.lineup.lineupId != lineupId)
                            /* Перевести их из CREATED */
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
        this.lineups = new Set();
        this.throwSpots = new Set();
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
        options: { except: Lineup[] } = { except: [] },
    ) {
        this.lineups.forEach((lineup) => {
            if (options.except.includes(lineup)) {
                return; /* Не обрабатывать этот lineup (т.к. он уже обработан) */
            }
            const landSpot = this.factory.spots.get(lineup.landId)!;
            const throwSpot = this.factory.spots.get(lineup.throwId)!;

            /* Handle ViewLine creation */
            const lineId: LineId = `${landSpot.spotId}<-${throwSpot.spotId}`;
            let viewLine = this.factory.viewLines.value.get(lineId);
            if (!viewLine) {
                viewLine = new ViewLine(landSpot, throwSpot, this.factory);
            }
            viewLine.lineups.add(lineup);
            /* Add viewLine to observers of current ViewLandSpot */
            this.observers.add(viewLine);
            /* Add viewLine into ViewLines */
            this.factory.viewLines.value.set(lineId, viewLine);

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
    /* Не обрабатывает тот, который стал selected */ ///////////////////////////////////////
    _deleteAndDepopulateOwnDependencies(
        options: { except: ViewLine[] } = { except: [] },
    ) {
        /* Для каждой линии, идущей из текущего landSpot */
        this.observers.forEach((observer) => {
            if (!options.except.includes(observer)) {
                const viewThrowSpot = this.factory.viewThrowSpots.value.get(
                    observer.throwSpot.spotId,
                )!;
                observer.context.activeLineups.forEach((lineup) => {
                    viewThrowSpot.context.activeLineups.delete(lineup);
                    observer.context.activeLineups.delete(lineup);
                });
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
    lineId: LineId; // `landId<-throwId`
    landSpot: Spot;
    throwSpot: Spot;
    lineups: Set<Lineup>;
    context: { activeLineups: Set<Lineup>; selectedLineups: Set<Lineup> };
    state: ViewLineState;
    states: ViewLineMachineObject;
    constructor(landSpot: Spot, throwSpot: Spot, factory: ViewItemsFactory) {
        this.lineId = `${landSpot.spotId}<-${throwSpot.spotId}`;
        this.landSpot = landSpot;
        this.throwSpot = throwSpot;
        this.lineups = new Set();
        this.context = {
            activeLineups: new Set(),
            selectedLineups: new Set(),
        };
        this.state = reactive<ViewLineState>({
            value: "CREATED",
        });
        this.states = {
            CREATED: {
                getPopulated: (landSpotId) => {
                    if (this.lineups.size === 1) {
                        this._setState("ONLY_ACTIVE_SINGLE");
                    } else if (this.lineups.size > 1) {
                        this._setState("ONLY_ACTIVE_MULTIPLE");
                    }
                    this.lineups.forEach((lineup) => {
                        this.context.activeLineups.add(lineup);
                    });
                    this.$sendToDependencies("getPopulated", this.lineId);
                },
            },
            ONLY_ACTIVE_SINGLE: {
                viewLandSpotContacted: (landSpotId) => {
                    this._setState("KILLED");
                    this.$sendToDependencies(
                        "viewLandSpotContacted",
                        this.lineId,
                    );
                    this.factory.viewLines.value.delete(this.lineId);
                },
                viewThrowSpotContacted: (throwSpotId) => {
                    this._setState("ONLY_SELECTED_SINGLE");
                    this.$sendToDependencies(
                        "viewThrowSpotContacted",
                        this.lineId,
                    );
                },
                selectedAnotherLine: (landSpotId) => {
                    this._setState("KILLED");
                    this.$sendToDependencies(
                        "viewLandSpotContacted",
                        this.lineId,
                    );
                    this.factory.viewLines.value.delete(this.lineId);
                },
            },
            ONLY_SELECTED_SINGLE: {
                viewLandSpotContacted: (landSpotId) => {
                    /* TODO */
                },
                viewThrowSpotContacted: (throwSpotId) => {
                    this._setState("KILLED");
                    this.factory.viewLines.value.delete(this.lineId);
                    this.$sendToDependencies(
                        "viewThrowSpotContacted",
                        this.lineId,
                    );
                },
            },
            ONLY_ACTIVE_MULTIPLE: {},
            ONLY_SELECTED_MULTIPLE: {},
            ACTIVE_AND_SELECTED: {},
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
        activeLineups: Set<Lineup>;
        selectedLineups: Set<Lineup>;
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
            activeLineups: new Set(),
            selectedLineups: new Set(),
        });
        this.state = reactive<ViewThrowSpotState>({
            value: "CREATED",
        });
        this.states = {
            // ViewThrowSpot и ViewLine создаются извне в состояние CREATED (при клике на ViewLandSpot)
            CREATED: {
                getPopulated: (lineId) => {
                    const viewLine = this.factory.viewLines.value.get(
                        lineId as LineId,
                    )!;
                    if (viewLine.lineups.size === 1) {
                        this._setState("ONLY_ACTIVE_SINGLE");
                    } else if (viewLine.lineups.size > 1) {
                        // Если из landSpot'а сюда летит сразу несколько лайнапов
                        this._setState("ONLY_ACTIVE_MULTIPLE");
                    }
                    this.observers.add(viewLine);
                    viewLine.lineups.forEach((lineup) => {
                        this.context.activeLineups.add(lineup);
                    });
                },
            },
            ONLY_ACTIVE_SINGLE: {
                selfClicked: () => {
                    this._setState("ONLY_SELECTED_SINGLE");
                    const activeLineup = this.context.activeLineups
                        .values()
                        .next().value;
                    this.context.activeLineups.delete(activeLineup);
                    this.context.selectedLineups.add(activeLineup);
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
                selectedAnotherLine: (lineId) => {
                    this._setState("KILLED");
                    this.factory.viewThrowSpots.value.delete(
                        this.throwSpot.spotId,
                    );
                },
            },
            ONLY_ACTIVE_MULTIPLE: {
                selfClicked: () => {
                    /* ⚡TODO: SelectForm */
                    alert("Unhandled multiple select");
                },
                viewLandSpotContacted: (lineId) => {
                    const viewLine = this.factory.viewLines.value.get(
                        lineId as LineId,
                    )!;
                    if (
                        viewLine.lineups.size == this.context.activeLineups.size
                    ) {
                        /* Если все активные лайнапы - от landSpot, то удаляемся */
                        this._setState("KILLED");
                        this.factory.viewThrowSpots.value.delete(
                            this.throwSpot.spotId,
                        );
                    } else {
                        /* Иначе вычищаемся от выключенного ViewLine'а*/
                        this.observers.delete(viewLine);
                        viewLine.lineups.forEach((lineup) => {
                            this.context.activeLineups.delete(lineup);
                        });
                        if (this.context.activeLineups.size == 1) {
                            this._setState("ONLY_ACTIVE_SINGLE");
                        }
                    }
                },
                selectedAnotherLine: (lineId) => {
                    const viewLine = this.factory.viewLines.value.get(
                        lineId as LineId,
                    )!;
                    if (
                        this.context.activeLineups.size ===
                        viewLine.lineups.size
                    ) {
                        this._setState("KILLED");
                        this.factory.viewThrowSpots.value.delete(
                            this.throwSpot.spotId,
                        );
                    }
                },
            },
            ONLY_SELECTED_SINGLE: {
                selfClicked: () => {
                    const selectedLineup = this.context.selectedLineups
                        .values()
                        .next().value as Lineup;
                    this._setState("KILLED");
                    this.factory.viewThrowSpots.value.delete(
                        this.throwSpot.spotId,
                    );
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
            viewLandSpot.lineups.add(lineup);
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
