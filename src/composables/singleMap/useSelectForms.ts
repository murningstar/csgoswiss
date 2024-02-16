import type { SelectFormThrowSpotContext } from "@/data/types/SelectFormContexts";
import { reactive } from "vue";

export function useSelectForms() {
    const selectFormThrowSpotContext = reactive<SelectFormThrowSpotContext>({
        value: {
            isFormVisible: false,
            viewThrowSpot: null,
            open(inputObj) {
                selectFormThrowSpotContext.value.viewThrowSpot =
                    inputObj.viewThrowSpot;
                if ("activeLineupsToSelected" in inputObj) {
                    selectFormThrowSpotContext.value.activeLineupsToBeSelected =
                        inputObj.activeLineupsToSelected;
                }
                if ("selectedLineupsToBeDeselected" in inputObj) {
                    selectFormThrowSpotContext.value.selectedLineupsToBeDeselected =
                        inputObj.selectedLineupsToBeDeselected;
                }
                selectFormThrowSpotContext.value.isFormVisible = true;
            },
            close() {
                selectFormThrowSpotContext.value.isFormVisible = false;
                this.reset();
            },
            reset() {
                selectFormThrowSpotContext.value.isFormVisible = false;
                selectFormThrowSpotContext.value.viewThrowSpot = null;
                delete selectFormThrowSpotContext.value
                    .activeLineupsToBeSelected;
                delete selectFormThrowSpotContext.value
                    .selectedLineupsToBeDeselected;
            },
        },
    });
    return { selectFormThrowSpotContext };
}
