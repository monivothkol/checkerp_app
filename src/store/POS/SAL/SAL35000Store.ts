import { defineStore } from "pinia";
import RetrievePackagingDetail from "@/services/api/SAL/retrievePackagingDetail";
import PackPackagingItem from "@/services/api/SAL/packPackagingItem";
import POP from "@/core/utilities/pop";
import type { PackagingHeader, PackagingItem, SAL34000Response } from "@/models/POS/SAL/SAL30000";

interface Baseline { quantityRequired: number; quantityPackaged: number }

/**
 * SAL35000 continue-packing store. Scans and quantity inputs only mutate the
 * LOCAL rows; nothing reaches the backend until the user explicitly confirms,
 * which sends every changed row and re-syncs from the final response.
 */
export const SAL35000Store = defineStore("SAL35000Store", {
    state: () => ({
        packagingId: "",
        loading: true,
        saving: false,
        header: null as PackagingHeader | null,
        items: [] as PackagingItem[],
        baseline: {} as Record<string, Baseline>,
        detailApi: RetrievePackagingDetail.getInstance(),
        packApi: PackPackagingItem.getInstance()
    }),
    getters: {
        /** Editable while pending/in-progress; DONE/CANCELLED are frozen. */
        editable(state): boolean {
            const s = state.header?.status;
            return s === "PENDING" || s === "IN_PROGRESS";
        },
        doneCount(state): number {
            return state.items.filter((i) => Number(i.quantityPackaged) >= Number(i.quantityRequired)).length;
        },
        /** Rows whose quantities differ from the last server state. */
        changedItems(state): PackagingItem[] {
            return state.items.filter((i) => {
                const b = state.baseline[i.itemId];
                return Number(i.quantityPackaged) !== b?.quantityPackaged
                    || Number(i.quantityRequired) !== b?.quantityRequired;
            });
        },
        hasChanges(): boolean {
            return this.changedItems.length > 0;
        }
    },
    actions: {
        isDone(item: PackagingItem): boolean {
            return Number(item.quantityPackaged) >= Number(item.quantityRequired);
        },
        load(packagingId: string, failTitle: string) {
            this.packagingId = packagingId;
            if (!packagingId) { this.loading = false; return; }
            this.loading = true;
            this.detailApi.request({
                dataBody: { packagingId },
                listener: {
                    onSuccess: (p) => { this.apply(p); this.loading = false; },
                    onFail: (e) => { this.loading = false; POP.alert({ title: failTitle, status: "error", content: e?.message }); }
                }
            });
        },
        /** Refresh header + items from a detail/pack response and reset the baseline. */
        apply(p: SAL34000Response) {
            this.header = p.packaging ?? null;
            this.items = p.items ?? [];
            this.baseline = Object.fromEntries(this.items.map((i) => [i.itemId, {
                quantityRequired: Number(i.quantityRequired),
                quantityPackaged: Number(i.quantityPackaged)
            }]));
        },
        /** LOCAL edit of an item's packed quantity — committed on confirm. */
        setPacked(itemId: string, qty: number) {
            const item = this.items.find((i) => i.itemId === itemId);
            if (item) item.quantityPackaged = Math.max(0, qty || 0);
        },
        /** LOCAL edit of an item's required quantity — committed on confirm. */
        setRequired(itemId: string, qty: number) {
            const item = this.items.find((i) => i.itemId === itemId);
            if (item) item.quantityRequired = Math.max(0, qty || 0);
        },
        /**
         * Scan: match the code to an item by barcode or product code and +1 its
         * packed qty LOCALLY. Returns the matched item (for the screen to toast),
         * or null when nothing matches.
         */
        scanPack(code: string): PackagingItem | null {
            const term = code.trim().toLowerCase();
            if (!term) return null;
            const item = this.items.find(
                (i) => (i.barcode ?? "").toLowerCase() === term || (i.productCode ?? "").toLowerCase() === term
            );
            if (!item) return null;
            this.setPacked(item.itemId, Number(item.quantityPackaged) + 1);
            return item;
        },
        /** Throw away local edits and go back to the last server state. */
        discard() {
            for (const item of this.items) {
                const b = this.baseline[item.itemId];
                if (b) {
                    item.quantityPackaged = b.quantityPackaged;
                    item.quantityRequired = b.quantityRequired;
                }
            }
        },
        /** Commit every changed row, one by one; the final response re-syncs the screen. */
        confirm(failTitle: string) {
            const changed = this.changedItems;
            if (!changed.length || this.saving) return;
            this.saving = true;
            const sendNext = (index: number) => {
                const item = changed[index];
                this.packApi.request({
                    dataBody: {
                        packagingId: this.packagingId,
                        itemId: item.itemId,
                        quantityPackaged: Number(item.quantityPackaged),
                        quantityRequired: Number(item.quantityRequired)
                    },
                    listener: {
                        onSuccess: (p) => {
                            if (index + 1 < changed.length) { sendNext(index + 1); return; }
                            this.apply(p);
                            this.saving = false;
                        },
                        onFail: (e) => {
                            this.saving = false;
                            POP.alert({ title: failTitle, status: "error", content: e?.message, errorCode: e?.code });
                            // Re-sync: some rows may have committed before the failure.
                            this.load(this.packagingId, failTitle);
                        }
                    }
                });
            };
            sendNext(0);
        }
    }
});
