/* eslint-disable no-unused-vars */
import { SharedDataStore } from "@/stores/shared-data";
import COM6000000 from "@/views/COM/COM6000000.vue";
import { BizCheckMobileLogger } from "@/shared/bizcheckmobile";
import DialogUtil from "./dialog-util";
import OfflineModeUpdate from "./offline-mode-update";

export function sessionFunc<T extends (...args: any[]) => any>(func: T, funName?: string,): (...args: Parameters<T>) => void {
    return (...args: Parameters<T>): void => {
        try {

            let isOffline: boolean = false;

            new OfflineModeUpdate().subscribe({
                onUpdate: (status) => {
                    isOffline = status;
                }
            });

            if (isOffline) {
                func(...args); // Call the original function
                return;
            }

            if (!JSON.parse(SharedDataStore().getItem("isSecondLogin") || "false")) {
                func(...args); // Call the original function
                return;
            }

            DialogUtil.showModal(COM6000000, {
                onDidDismiss: (resp) => {
                    try {

                        if (resp.role === "cancel") {
                            return;
                        }

                        func(...args); // Call the original function

                    } catch (err: any) {
                        BizCheckMobileLogger.error(funName, new Error(`${funName} ${err.message}`)); // Re-throw the error after logging
                        throw new Error(`${funName} ${err.message}`);
                    }
                },
            });

        } catch (err: any) {
            BizCheckMobileLogger.error(funName, new Error(`${funName} ${err.message}`)); // Re-throw the error after logging
            throw new Error(`${funName} ${err.message}`);
        }
    };
}