import type { Lineup } from "../interfaces/Lineup";
import type { ViewThrowSpot, ViewLine, ViewLandSpot } from "./ViewItems";

type SelectFormThrowSpotInput = {
    viewThrowSpot: ViewThrowSpot;
    activeLineupsToSelected?: Lineup[];
    selectedLineupsToBeDeselected?: Lineup[];
};

export type SelectFormThrowSpotContext = {
    value: {
        isFormVisible: boolean;
        viewThrowSpot: null | ViewThrowSpot;
        activeLineupsToBeSelected?: Lineup[];
        selectedLineupsToBeDeselected?: Lineup[];
        open: (inputObj: SelectFormThrowSpotInput) => void;
        close: Function;
        reset: Function;
    };
};

// export type SelectFormLineupLineContext = {
//     value: {
//         isFormVisible: boolean;
//         clickedViewItemType:
//             | null
//             | "viewThrowSpot"
//             | "viewLine"
//             | "viewLandSpot";
//         viewItem: null | ViewThrowSpot | ViewLine | ViewLandSpot;
//         activeLineupsToBeSelected?: Lineup[];
//         selectedLineupsToBeDeselected?: Lineup[];
//         open: (inputObj: SelectFormInput) => void;
//         close: Function;
//         reset: Function;
//     };
// };

// export type SelectFormLandSpotContext = {
//     value: {
//         isFormVisible: boolean;
//         clickedViewItemType:
//             | null
//             | "viewThrowSpot"
//             | "viewLine"
//             | "viewLandSpot";
//         viewItem: null | ViewThrowSpot | ViewLine | ViewLandSpot;
//         activeLineupsToBeSelected?: Lineup[];
//         selectedLineupsToBeDeselected?: Lineup[];
//         open: (inputObj: SelectFormInput) => void;
//         close: Function;
//         reset: Function;
//     };
// };
