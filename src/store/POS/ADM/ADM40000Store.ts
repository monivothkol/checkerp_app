import { defineStore } from "pinia";
import RetrieveStoreOperationSettings from "@/services/api/ADM/retrieveStoreOperationSettings";
import SaveStoreOperationSettings from "@/services/api/ADM/saveStoreOperationSettings";
import POP from "@/core/utilities/pop";
import type { ModuleApiError } from "@/services/api/COMMON/module-api";
import type { SaveMessages } from "@/store/POS/ADM/ADM31000Store";

/** ADM40000 store-operation settings store: load + save in place. */
export const ADM40000Store = defineStore("ADM40000Store", {
    state: () => ({
        loading: true,
        saving: false,
        form: { totalFloors: 1, hasTableNumber: false, totalTables: 0, enableSequenceOrdering: false, sequenceNumber: 0, enablePrinting: false, notes: "" },
        retrieveApi: RetrieveStoreOperationSettings.getInstance(),
        saveApi: SaveStoreOperationSettings.getInstance()
    }),
    actions: {
        load() {
            this.loading = true;
            this.retrieveApi.request({
                dataBody: {},
                listener: {
                    onSuccess: (p) => {
                        this.form = {
                            totalFloors: p.totalFloors ?? 1,
                            hasTableNumber: !!p.hasTableNumber,
                            totalTables: p.totalTables ?? 0,
                            enableSequenceOrdering: !!p.enableSequenceOrdering,
                            sequenceNumber: p.sequenceNumber ?? 0,
                            enablePrinting: !!p.enablePrinting,
                            notes: p.notes ?? ""
                        };
                        this.loading = false;
                    },
                    onFail: () => { this.loading = false; }
                }
            });
        },
        save(msgs: SaveMessages) {
            this.saving = true;
            this.saveApi.request({
                dataBody: { ...this.form },
                listener: {
                    onSuccess: () => {
                        this.saving = false;
                        POP.alert({ title: msgs.savedTitle, status: "success", content: msgs.savedMsg });
                        this.load();
                    },
                    onFail: (e: ModuleApiError) => {
                        this.saving = false;
                        POP.alert({ title: msgs.failedTitle, status: "error", content: e?.message, errorCode: e?.code });
                    }
                }
            });
        }
    }
});
