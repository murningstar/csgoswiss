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
import type { SelectFormThrowSpotContext } from "./SelectFormContexts";

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
    [key in ViewLandSpotStateUnion]: Partial<Record<ViewItemEventType, (senderId: string) => void>>;
};
type ViewLineMachineObject = {
    [key in ViewLineStateUnion]: Partial<Record<ViewItemEventType, (senderId: string) => void>>;
};
type ViewThrowSpotMachineObject = {
    [key in ViewThrowSpotStateUnion]: Partial<
        Record<ViewItemEventType, (senderId: string) => void>
    >;
};

type ViewLandSpotEventUnion =
    | "viewLandSpotActivatedOnClick"
    | "viewLandSpotDeactivatedOnClick"
    | "viewThrowSpotContacted"
    | "selfClicked";
type ViewLineEventUnion = "viewLandSpotContacted" | "viewThrowSpotContacted" | "selfClicked";
type ViewFromSpotEventUnion = "viewLandSpotContacted" | "viewThrowSpotContacted" | "selfClicked";
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

type ViewLandSpotMessage = {
    senderId: string;
    myNewState: ViewLandSpotStateUnion;
    affectedLineups: Lineup[];
};

type ViewThrowSpotMessage = {
    senderId: string;
    myNewState: ViewThrowSpotStateUnion;
    affectedLineups: Lineup[];
};
/* ### Observers & Observables */
/* Interface to make a ViewItem class an Observer and Observable */
interface ViewLandSpotObservableObserver {
    $sendToDependencies: (messageObj: ViewLandSpotMessage) => void;
}
interface ViewLineObservableObserver {
    $sendToDependencies: (event: ViewLineEventUnion, senderId: string) => void;
}
interface ViewThrowSpotObservableObserver {
    $sendToDependencies: (messageObj: ViewThrowSpotMessage) => void;
}

type LineId = `${Spot["spotId"]}<-${Spot["spotId"]}`;

// Позже убрать Ref с тех элементов, реактивность для которых не нужна,
// то есть с тех, значения которых не изменяются через "this." в методах.
export class ViewLandSpot implements ViewLandSpotStateMachine, ViewLandSpotObservableObserver {
    landSpot: Spot;
    state: ViewLandSpotState;
    states: ViewLandSpotMachineObject;
    observingViewLines: Set<ViewLine>;
    readonly lineups: Set<Lineup>; // Используется для фильтрации
    readonly throwSpots: Set<Spot>;
    avgDuration: { value: string | null }; // Вычисляется при активации. Просто так.
    hslColor: { value: string | null }; // Вычисляется при активации. Чтобы 1й всегда был желтым
    mediator: SelectFormMediator; // .selectFormContext is reactive
    readonly factory: ViewItemsFactory;

    constructor(landSpot: Spot, mediator: SelectFormMediator, factory: ViewItemsFactory) {
        this.landSpot = landSpot;
        this.state = reactive<ViewLandSpotState>({
            value: "INACTIVE_UNSELECTED",
        });
        this.states = {
            INACTIVE_UNSELECTED: {
                selfClicked: () => {
                    this._setState("ONLY_ACTIVE_MULTIPLE");
                    this._createAndPopulateOwnDependencies();
                    this.$sendToDependencies("getActivatedAfterCreation", this.landSpot.spotId);
                    this.initializeHslColor();
                },
            },
            ONLY_ACTIVE_MULTIPLE: {
                selfClicked: () => {
                    this._setState("INACTIVE_UNSELECTED");
                    // this.$sendToDependencies()
                    this.observingViewLines.forEach((viewLine) => {
                        viewLine.$send("viewLandSpotDeactivatedOnClick", this.landSpot.spotId);
                        this.observingViewLines.delete(viewLine); // Это может вызвать ошибку, будет здорово, если нет
                    });
                    console.log("land selfclicked, deactivating");
                },
                viewThrowSpotContacted: (lineId) => {
                    this._setState("ONLY_SELECTED_SINGLE");
                    const viewLine = this.factory.viewLines.value.get(lineId as LineId)!;
                    this.observingViewLines.forEach((observer) => {
                        if (observer == viewLine) return;
                        observer.$send("selectedAnotherLine", this.landSpot.spotId);
                    });
                },
                //⚡⚡⚡###############################
                selectFormThrowSpotSelected: (selectedLineupId) => {
                    this._setState("ONLY_SELECTED_SINGLE");
                    const lineup = this.factory.lineups.get(selectedLineupId)!;
                    const viewLine = this.factory.viewLines.value.get(
                        `${lineup.landId}<-${lineup.throwId}`,
                    )!;
                    this.observingViewLines.forEach((observer) => {
                        if (observer == viewLine) return;
                        observer.$send("selectedAnotherLine", this.landSpot.spotId);
                    });
                },
            },
            ONLY_SELECTED_SINGLE: {
                selfClicked: () => {
                    /* TODO */
                },
                viewThrowSpotContacted: (lineId) => {
                    this._setState("ONLY_ACTIVE_MULTIPLE");
                    this.__clearObserverByLineId(lineId);
                    this._createAndPopulateOwnDependencies();
                    this.observingViewLines.forEach((observer) => {
                        // if (observer != viewLine)
                        /* Перевести их из CREATED */
                        observer.$send("getActivatedAfterCreation", this.landSpot.spotId); // вызывает подозрения, но вроде всё правильно
                    });
                },
                selectFormThrowSpotDeselected: (deselectedLineupId) => {
                    this._setState("ONLY_ACTIVE_MULTIPLE");
                    this.__clearObserverByLineupId(deselectedLineupId);
                    this._createAndPopulateOwnDependencies();
                    this.observingViewLines.forEach((observer) => {
                        /* viewLine удаляется из factory.viewLines во viewLine
                        обработчике по такому же сообщению от selectFormThrowSpot.
                        Поэтому его в this.observers не будет */
                        // if (observer != viewLine)
                        /* Перевести их из CREATED */
                        observer.$send("getActivatedAfterCreation", this.landSpot.spotId); // вызывает подозрения, но вроде всё правильно
                    });
                },
            },
            ONLY_SELECTED_MULTIPLE: {
                /* TODO */
            },
            ACTIVE_AND_SELECTED: {
                /* TODO */
                selectFormThrowSpotSelected: (selectedLineupId) => {},
            },
        };
        this.observingViewLines = new Set();
        this.lineups = new Set();
        this.throwSpots = new Set();
        this.avgDuration = reactive({ value: "3.0" });
        this.hslColor = reactive({ value: null });
        this.mediator = mediator;
        this.factory = factory;
    }

    $send(event: ViewItemEventType, senderId: Spot["spotId"]) {
        const handler = this.states[this.state.value][event];
        if (handler) handler(senderId);
    }
    $sendToDependencies(event: ViewItemEventType, senderId: Spot["spotId"]) {
        this.observingViewLines.forEach((observer) => {
            observer.$send(event, senderId);
        });
    }
    /* When `this` (ViewLandSpot) transitions throw INACTIVE_UNSELECTED into ONLY_ACTIVE; */
    _createAndPopulateOwnDependencies(options: { except: Lineup[] } = { except: [] }) {
        this.lineups.forEach((lineup) => {
            if (options.except.includes(lineup)) {
                return; /* Пропустить этот lineup */
            }
            const landSpot = this.factory.spots.get(lineup.landId)!;
            const throwSpot = this.factory.spots.get(lineup.throwId)!;

            /* Handle ViewLine creation */
            const lineId: LineId = `${landSpot.spotId}<-${throwSpot.spotId}`;

            let viewLine = this.factory.viewLines.value.get(lineId);
            if (!viewLine) {
                viewLine = new ViewLine(landSpot, throwSpot, this.mediator, this.factory);
            }
            viewLine = reactive(viewLine);
            viewLine.lineups.add(lineup);
            this.observingViewLines.add(viewLine);
            /* Add viewLine into ViewLines */
            this.factory.viewLines.value.set(lineId, viewLine);

            /* Handle ViewThrowSpot creation */
            let viewThrowSpot = this.factory.viewThrowSpots.value.get(lineup.throwId);
            if (!viewThrowSpot) {
                viewThrowSpot = new ViewThrowSpot(throwSpot, this.mediator, this.factory);
            }
            viewThrowSpot = reactive(viewThrowSpot);
            this.factory.viewThrowSpots.value.set(throwSpot.spotId, viewThrowSpot);
        });
    }
    /* Не обрабатывает тот, который стал selected */ ///////////////////////////////////////
    _deleteAndDepopulateOwnDependencies(options: { except: ViewLine[] } = { except: [] }) {
        /* Для каждой линии, идущей из текущего landSpot */
        this.observingViewLines.forEach((observer) => {
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
                    this.factory.viewThrowSpots.value.delete(viewThrowSpot.throwSpot.spotId);
                }

                this.factory.viewLines.value.delete(observer.lineup.lineupId);

                this.observingViewLines.delete(observer);
            }
        });
    }
    __clearObserverByLineId(lineId: string) {
        this.observingViewLines.forEach((viewLine) => {
            if (viewLine.lineId == lineId) {
                this.observingViewLines.delete(viewLine);
            }
        });
    }
    __clearObserverByLineupId(lineupId: string) {
        this.observingViewLines.forEach((viewLine) => {
            let viewLineWithLineupId;
            viewLine.lineups.forEach((lineup) => {
                if (lineup.lineupId == lineupId) {
                    viewLineWithLineupId = viewLine;
                }
            });
            this.observingViewLines.delete(viewLineWithLineupId!);
        });
    }
    initializeHslColor() {
        let nonInactiveLandSpotsCount = 0;
        for (let viewLandSpot of this.factory.viewLandSpots.value.values()) {
            const isInactive = viewLandSpot.state.value == "INACTIVE_UNSELECTED";
            if (!isInactive) {
                nonInactiveLandSpotsCount++;
            }
        }
        this.hslColor.value =
            nonInactiveLandSpotsCount > 1 ? (Math.random() * 359).toFixed(0) : "52";
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
export class ViewLine implements ViewLineStateMachine, ViewLineObservableObserver {
    lineId: LineId; // `landId<-throwId`
    landSpot: Spot;
    throwSpot: Spot;
    lineups: Set<Lineup>;
    context: { activeLineups: Set<Lineup>; selectedLineups: Set<Lineup> };
    state: ViewLineState;
    states: ViewLineMachineObject;
    mediator: SelectFormMediator; // .selectFormContext is reactive
    readonly factory: ViewItemsFactory;
    constructor(
        landSpot: Spot,
        throwSpot: Spot,
        mediator: SelectFormMediator,
        factory: ViewItemsFactory,
    ) {
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
                getActivatedAfterCreation: (landSpotId) => {
                    if (this.lineups.size === 1) {
                        this._setState("ONLY_ACTIVE_SINGLE");
                    } else if (this.lineups.size > 1) {
                        this._setState("ONLY_ACTIVE_MULTIPLE");
                    }
                    this.lineups.forEach((lineup) => {
                        this.context.activeLineups.add(lineup);
                    });
                    this.$sendToDependencies("getActivatedAfterCreation", this.lineId);
                },
            },
            ONLY_ACTIVE_SINGLE: {
                viewLandSpotDeactivatedOnClick: (landSpotId) => {
                    this._setState("KILLED");
                    console.log("viewline viewLandSpotDeactivatedOnClick, deactivating");
                    this.$sendToDependencies("viewLandSpotDeactivatedOnClick", this.lineId);
                    this.factory.viewLines.value.delete(this.lineId);
                },
                viewThrowSpotContacted: (throwSpotId) => {
                    this._setState("ONLY_SELECTED_SINGLE");
                    this.$sendToDependencies("viewThrowSpotContacted", this.lineId);
                },
                selectedAnotherLine: (landSpotId) => {
                    this._setState("KILLED");
                    this.$sendToDependencies("viewLandSpotDeactivatedOnClick", this.lineId);
                    this.factory.viewLines.value.delete(this.lineId);
                },
                selectFormThrowSpotSelected: (selectedLineupId) => {
                    this._setState("ONLY_SELECTED_SINGLE");
                    const lineup = this.factory.lineups.get(selectedLineupId)!;
                    this.context.activeLineups.delete(lineup);
                    this.context.selectedLineups.add(lineup);
                },
            },
            ONLY_SELECTED_SINGLE: {
                viewLandSpotActivatedOnClick: (landSpotId) => {
                    /* TODO */
                },
                viewLandSpotDeactivatedOnClick: (landSpotId) => {
                    /* TODO */
                },
                viewThrowSpotContacted: (throwSpotId) => {
                    this.$sendToDependencies("viewThrowSpotContacted", this.lineId);
                    setTimeout(() => {
                        const viewLandSpot = this.factory.viewLandSpots.value.get(
                            this.landSpot.spotId,
                        )!;
                        if (
                            viewLandSpot.state.value == "ONLY_SELECTED_SINGLE" ||
                            viewLandSpot.state.value == "ONLY_SELECTED_MULTIPLE"
                        ) {
                            if (this.context.selectedLineups.size == 1) {
                                this._setState("ONLY_SELECTED_SINGLE");
                            } else {
                                return;
                            }
                        } else {
                            this._setState("ACTIVE_AND_SELECTED");
                            this.context.activeLineups.add(lineup);
                        }
                        this._setState("ONLY_ACTIVE_SINGLE");
                    }, 0);
                },
                selectFormThrowSpotDeselected: (deselectedLineupId) => {
                    this._setState("ONLY_ACTIVE_SINGLE");
                },
                // Сработает, когда из multiSelect
                getActivatedAfterCreation: (lineId) => {},
                /*  */
                /*  */
                /*  */
                /*  */
                /*  */
                /* TODO: ПЕРЕДЕЛАТЬ, ЧТОБЫ DESELECT НЕ ДЕЛАЛ KILLED */
                /*  */
                /*  */
                /*  */
                /*  */
            },
            ONLY_ACTIVE_MULTIPLE: {
                ///////////////////
                viewLandSpotDeactivatedOnClick: (landSpotId) => {
                    this._setState("KILLED");
                    this.$sendToDependencies("viewLandSpotContacted", this.lineId);
                    this.factory.viewLines.value.delete(this.lineId);
                },
                selectFormThrowSpotSelected: (selectedLineupId) => {
                    this._setState("ONLY_SELECTED_SINGLE");
                    const lineup = this.factory.lineups.get(selectedLineupId)!;
                    this.context.activeLineups.clear();
                    this.context.selectedLineups.add(lineup);
                },
            },
            ONLY_SELECTED_MULTIPLE: {
                selectFormThrowSpotDeselected: (deselectedLineupId) => {
                    const lineup = this.factory.lineups.get(deselectedLineupId)!;
                    this.context.selectedLineups.delete(lineup);
                    const viewLandSpot = this.factory.viewLandSpots.value.get(lineup.landId)!;
                    setTimeout(() => {
                        if (
                            viewLandSpot.state.value == "ONLY_SELECTED_SINGLE" ||
                            viewLandSpot.state.value == "ONLY_SELECTED_MULTIPLE"
                        ) {
                            if (this.context.selectedLineups.size == 1) {
                                this._setState("ONLY_SELECTED_SINGLE");
                            } else {
                                return;
                            }
                        } else {
                            this._setState("ACTIVE_AND_SELECTED");
                            this.context.activeLineups.add(lineup);
                        }
                    }, 0);
                },
                viewLandSpotDeactivatedOnClick: (landSpotId) => {
                    /* TODO */
                },
                viewLandSpotActivatedOnClick: (landSpotId) => {
                    /* TODO */
                },
            },
            ACTIVE_AND_SELECTED: {
                selectFormThrowSpotDeselected: (deselectedLineupId) => {
                    const lineup = this.factory.lineups.get(deselectedLineupId)!;
                    this.context.selectedLineups.delete(lineup);
                    const selectedCount = this.context.selectedLineups.size;
                    const activeCount = this.context.activeLineups.size;
                    if (selectedCount >= 1 && activeCount >= 1) {
                        return; // stay in "ACTIVE_AND_SELECTED"
                    } else if (selectedCount == 0 && activeCount == 1) {
                        this._setState("ONLY_ACTIVE_SINGLE");
                    } else if (selectedCount == 0 && activeCount > 1) {
                        this._setState("ONLY_ACTIVE_MULTIPLE");
                    }
                },
                viewLandSpotDeactivatedOnClick: (landSpotId) => {
                    /* TODO */
                },
                viewLandSpotActivatedOnClick: (landSpotId) => {
                    /* TODO */
                },
            },
            KILLED: {},
        };
        this.mediator = mediator;
        this.factory = factory;
    }
    $send(event: ViewItemEventType, senderId: string) {
        const handler = this.states[this.state.value][event];
        if (handler) handler(senderId);
    }
    $sendToDependencies(event: ViewItemEventType, senderId: string) {
        // if (event == "viewLandSpotContacted") {
        //     const viewThrowSpot = this.factory.viewThrowSpots.value.get(this.throwSpot.spotId)!;
        //     viewThrowSpot.$send("viewLandSpotContacted", senderId);
        // }
        // if (event == "viewThrowSpotContacted") {
        //     const viewLandSpot = this.factory.viewLandSpots.value.get(this.landSpot.spotId)!;
        //     viewLandSpot.$send("viewThrowSpotContacted", senderId);
        // }
        // if (event == "getActivatedAfterCreation") {
        //     let viewThrowSpot = this.factory.viewThrowSpots.value.get(this.throwSpot.spotId)!;
        //     viewThrowSpot.$send("getActivatedAfterCreation", senderId);
        // }
        const viewThrowSpot = this.factory.viewThrowSpots.value.get(this.throwSpot.spotId)!;
        const viewLandSpot = this.factory.viewLandSpots.value.get(this.landSpot.spotId)!;
        viewLandSpot.$send(event, this.lineId);
        viewThrowSpot.$send(event, this.lineId);
    }
    _setState(newState: ViewLineStateUnion) {
        this.state.value = newState;
    }
}

export class ViewThrowSpot implements ViewThrowSpotStateMachine, ViewThrowSpotObservableObserver {
    throwSpot: Spot;
    context: {
        activeLineups: Set<Lineup>;
        selectedLineups: Set<Lineup>;
    };
    state: ViewThrowSpotState;
    states: ViewThrowSpotMachineObject;
    observers: Set<ViewLine>;
    mediator: SelectFormMediator; // .selectFormContext is reactive
    readonly factory: ViewItemsFactory;
    constructor(
        throwSpot: Spot,
        // lineupIds: Lineup["lineupId"][];
        /* state: ViewThrowSpotState // Возможно нужно будет принимать нужный стейт для
        1) Создании при клике на ViewLandSpot
        2) Инициализации выбранных лайнапов из url'а (в onMounted) */
        mediator: SelectFormMediator,
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
                getActivatedAfterCreation: (lineId) => {
                    console.log("get pop");
                    const viewLine = this.factory.viewLines.value.get(lineId as LineId)!;
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
                    const activeLineup = this.context.activeLineups.values().next().value;
                    this.context.activeLineups.delete(activeLineup);
                    this.context.selectedLineups.add(activeLineup);
                    this.$sendToDependencies("viewThrowSpotContacted", this.throwSpot.spotId);
                },
                viewLandSpotActivatedOnClick: (lineId) => {
                    this._setState("ONLY_ACTIVE_MULTIPLE");
                    const anotherActiveLine = this.factory.viewLines.value.get(lineId as LineId)!;
                    anotherActiveLine.lineups.forEach((lineup) => {
                        this.context.activeLineups.add(lineup);
                    });
                    this.observers.add(anotherActiveLine);
                },
                viewLandSpotDeactivatedOnClick: (lineId) => {
                    this._setState("KILLED");
                    this.factory.viewThrowSpots.value.delete(this.throwSpot.spotId);
                }, //🔴🔴
                selectedAnotherLine: (lineId) => {
                    this._setState("KILLED");
                    this.factory.viewThrowSpots.value.delete(this.throwSpot.spotId);
                },
                getActivatedAfterCreation: (lineId) => {
                    this._setState("ONLY_ACTIVE_MULTIPLE");
                    const viewLine = this.factory.viewLines.value.get(lineId as LineId)!;
                    viewLine.lineups.forEach((lineup) => {
                        this.context.activeLineups.add(lineup);
                    });
                    this.observers.add(viewLine);
                },
            },
            ONLY_ACTIVE_MULTIPLE: {
                viewLandSpotDeactivatedOnClick: (lineId) => {
                    console.log(123);
                    const viewLine = this.factory.viewLines.value.get(lineId as LineId)!;
                    if (viewLine.lineups.size == this.context.activeLineups.size) {
                        /* Если все активные лайнапы - от landSpot, то удаляемся */
                        this._setState("KILLED");
                        this.factory.viewThrowSpots.value.delete(this.throwSpot.spotId);
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
                viewLandSpotActivatedOnClick: (lineId) => {
                    const anotherActiveLine = this.factory.viewLines.value.get(lineId as LineId)!;
                    anotherActiveLine.lineups.forEach((lineup) => {
                        this.context.activeLineups.add(lineup);
                    });
                    this.observers.add(anotherActiveLine);
                },
                selectedAnotherLine: (lineId) => {
                    const viewLine = this.factory.viewLines.value.get(lineId as LineId)!;
                    if (this.context.activeLineups.size === viewLine.lineups.size) {
                        this._setState("KILLED");
                        this.factory.viewThrowSpots.value.delete(this.throwSpot.spotId);
                    } else {
                        this.observers.delete(viewLine);
                        viewLine.lineups.forEach((lineup) => {
                            this.context.activeLineups.delete(lineup);
                        });
                        if (this.context.activeLineups.size === 1) {
                            this._setState("ONLY_ACTIVE_SINGLE");
                        }
                    }
                },
                getActivatedAfterCreation: (lineId) => {
                    this._setState("ONLY_ACTIVE_MULTIPLE");
                    const viewLine = this.factory.viewLines.value.get(lineId as LineId)!;
                    viewLine.lineups.forEach((lineup) => {
                        this.context.activeLineups.add(lineup);
                    });
                    this.observers.add(viewLine);
                },
                selfClicked: () => {
                    /* ⚡TODO: SelectForm */
                    this.mediator.selectFormThrowSpotContext.value.open({
                        viewThrowSpot: this,
                        activeLineupsToSelected: [...this.context.activeLineups],
                    });
                },
                selectFormThrowSpotSelected: (selectedLineupId) => {
                    const selectedLineup = this.factory.lineups.get(selectedLineupId)!;
                    if (this.observers.size == 1) {
                        this._setState("ONLY_SELECTED_SINGLE");
                        this.context.selectedLineups.add(selectedLineup);
                        this.context.activeLineups.clear();
                    } else if (this.observers.size > 1) {
                        this._setState("ACTIVE_AND_SELECTED");
                        const affectedViewLine = [...this.observers].find((viewLine) => {
                            return viewLine.lineups.has(selectedLineup);
                        })!;
                        /* Если из одного TS летит 3L в один LS и 3 в другой LS,
                        то для того, который выбран делаем  */
                        affectedViewLine.lineups.forEach((lineuP) => {
                            if (lineuP !== selectedLineup) {
                                this.context.activeLineups.delete(lineuP);
                            } else {
                                this.context.activeLineups.delete(selectedLineup);
                                this.context.selectedLineups.add(selectedLineup);
                            }
                        });
                    }
                },
            },
            ONLY_SELECTED_SINGLE: {
                selfClicked: () => {
                    this._setState("KILLED");
                    const deselectedLineup = this.context.selectedLineups.values().next()
                        .value as Lineup;
                    this.factory.viewThrowSpots.value.delete(this.throwSpot.spotId);
                    this.$sendToDependencies("viewThrowSpotContacted", this.throwSpot.spotId);
                },
                viewLandSpotActivatedOnClick: (lineId) => {
                    this._setState("ACTIVE_AND_SELECTED");
                    const anotherActiveLine = this.factory.viewLines.value.get(lineId as LineId)!;
                    anotherActiveLine.lineups.forEach((lineup) => {
                        this.context.activeLineups.add(lineup);
                    });
                    this.observers.add(anotherActiveLine);
                },
                selectFormLandSpotSelected: (lineupId) => {
                    /* 🔴 TODO  */
                },
            },
            ONLY_SELECTED_MULTIPLE: {
                selfClicked: () => {
                    /* ⚡TODO: SelectForm */
                    this.mediator.selectFormThrowSpotContext.value.open({
                        viewThrowSpot: this,
                        selectedLineupsToBeDeselected: [...this.context.selectedLineups],
                    });
                },
                viewLandSpotActivatedOnClick: (lineId) => {
                    const anotherActiveLine = this.factory.viewLines.value.get(lineId as LineId)!;
                    anotherActiveLine.lineups.forEach((lineup) => {
                        this.context.activeLineups.add(lineup);
                    });
                    this.observers.add(anotherActiveLine);
                },
                selectFormThrowSpotDeselected: (deselectedLineupId) => {
                    const lineup = this.factory.lineups.get(deselectedLineupId)!;
                    this.context.selectedLineups.delete(lineup);
                    const viewLine = this.factory.viewLines.value.get(
                        `${lineup.landId}<-${lineup.throwId}`,
                    )!;
                    this.observers.delete(viewLine);
                    const selectedCount = this.context.selectedLineups.size;
                    if (selectedCount > 1) {
                        return;
                    } else if (selectedCount == 1) {
                        this._setState("ONLY_SELECTED_SINGLE");
                    }
                },
                selectFormLandSpotSelected: (lineupId) => {
                    /* 🔴 TODO  */
                },
            },
            ACTIVE_AND_SELECTED: {
                selfClicked: () => {
                    /* ⚡TODO: SelectForm */
                    this.mediator.selectFormThrowSpotContext.value.open({
                        viewThrowSpot: this,
                        activeLineupsToSelected: [...this.context.activeLineups],
                        selectedLineupsToBeDeselected: [...this.context.selectedLineups],
                    });
                },
                selectFormThrowSpotSelected: (selectedLineupId) => {
                    const lineup = this.factory.lineups.get(selectedLineupId)!;
                    this.context.activeLineups.delete(lineup);
                    this.context.selectedLineups.add(lineup);
                    if (this.context.activeLineups.size < 1) {
                        this._setState("ONLY_SELECTED_MULTIPLE");
                    }
                },
                selectFormThrowSpotDeselected: (deselectedLineupId) => {
                    const lineup = this.factory.lineups.get(deselectedLineupId)!;
                    this.context.selectedLineups.delete(lineup);
                    const viewLine = this.factory.viewLines.value.get(
                        `${lineup.landId}<-${lineup.throwId}`,
                    )!;
                    const selectedCount = this.context.selectedLineups.size;
                    const activeCount = this.context.activeLineups.size;
                    if (selectedCount >= 1 && activeCount >= 1) {
                        return; // stay in "ACTIVE_AND_SELECTED"
                    } else if (selectedCount == 0 && activeCount == 1) {
                        this._setState("ONLY_ACTIVE_SINGLE");
                        this.observers.delete(viewLine);
                    } else if (selectedCount == 0 && activeCount > 1) {
                        this._setState("ONLY_ACTIVE_MULTIPLE");
                        this.observers.delete(viewLine);
                    }
                },
                viewLandSpotDeactivatedOnClick: (lineId) => {
                    const viewLine = this.factory.viewLines.value.get(lineId as LineId)!;
                    this.observers.delete(viewLine);
                    viewLine.lineups.forEach((lineup) => {
                        this.context.activeLineups.delete(lineup);
                    });
                    const activeCount = this.context.activeLineups.size;
                    const selectedCount = this.context.selectedLineups.size;
                    // remain active and selected
                    if (selectedCount >= 1 && activeCount >= 1) {
                        return;
                    }
                    // selected single
                    if (selectedCount == 1 && activeCount == 0) {
                        this._setState("ONLY_SELECTED_SINGLE");
                    }
                    // selected multiple
                    if (selectedCount > 1 && activeCount == 0) {
                        this._setState("ONLY_SELECTED_MULTIPLE");
                    }
                },
                viewLandSpotActivatedOnClick: (lineId) => {
                    const anotherActiveLine = this.factory.viewLines.value.get(lineId as LineId)!;
                    anotherActiveLine.lineups.forEach((lineup) => {
                        this.context.activeLineups.add(lineup);
                    });
                    this.observers.add(anotherActiveLine);
                },
                selectFormLandSpotSelected: (lineupId) => {
                    /* 🔴 TODO  */
                },
                selectFormLandSpotDeselected: (lineupId) => {
                    /* 🔴 TODO  */
                },
            },
            KILLED: {},
        };
        this.observers = new Set();
        this.mediator = mediator;
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
    __clearObserverByLineId(lineId: string) {
        this.observers.forEach((viewLine) => {
            if (viewLine.lineId == lineId) {
                this.observers.delete(viewLine);
            }
        });
    }
    __clearObserverByLineupId(lineupId: string) {
        this.observers.forEach((viewLine) => {
            let viewLineWithLineupId;
            viewLine.lineups.forEach((lineup) => {
                if (lineup.lineupId == lineupId) {
                    viewLineWithLineupId = viewLine;
                }
            });
            this.observers.delete(viewLineWithLineupId!);
        });
    }
}

export class SelectFormMediator {
    selectFormThrowSpotContext: SelectFormThrowSpotContext; // Reactive
    constructor(selectFormThrowSpotContext: SelectFormThrowSpotContext) {
        this.selectFormThrowSpotContext = selectFormThrowSpotContext; // Reactive
    }
}

export class ViewItemsFactory {
    readonly lineups: Map<Lineup["lineupId"], Lineup>;
    readonly spots: Map<Spot["spotId"], Spot>;
    readonly lineupIdNameMap: Map<string, string>;
    readonly mediator: SelectFormMediator;
    viewLandSpots: ViewLandSpotsHashMap; // Reactive
    viewLines: ViewLinesHashMap; // Reactive
    viewThrowSpots: ViewThrowSpotsHashMap; // Reactive

    constructor(
        spots: SpotsHashMap,
        lineups: LineupsHashMap,
        viewLandSpots: ViewLandSpotsHashMap, // Reactive
        viewLines: ViewLinesHashMap, // Reactive
        viewThrowSpots: ViewThrowSpotsHashMap, // Reactive
        mediator: SelectFormMediator, // .selectFormContext is reactive
    ) {
        this.lineups = lineups;
        this.spots = spots;
        this.mediator = mediator;
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
                const viewLandSpot = new ViewLandSpot(landSpot, this.mediator, this);
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
