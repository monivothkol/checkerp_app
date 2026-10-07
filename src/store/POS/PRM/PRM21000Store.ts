import { defineStore } from "pinia";
import RetrieveStaffList from "@/services/api/STM/retrieveStaffList";
import RetrieveAdjustmentTypeList from "@/services/api/PRM/retrieveAdjustmentTypeList";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";
import type { StaffLookup } from "@/models/POS/COMMON/lookups";
import type { AdjustmentType, StaffOption, AdjustmentTypeOption } from "@/models/POS/PRM/PRM21000";

/** PRM21000 adjustment-create form store: lookups, validation, and draft handoff to PRM22000. */
export const PRM21000Store = defineStore("PRM21000Store", {
    state: () => {
        const now = new Date();
        return {
            staffId: undefined as string | undefined,
            typeId: undefined as string | undefined,
            amount: undefined as number | undefined,
            effectiveMonth: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
            remark: "",
            staff: [] as StaffLookup[],
            types: [] as AdjustmentType[],
            loadingStaff: false,
            loadingTypes: false,
            staffApi: RetrieveStaffList.getInstance(),
            typeApi: RetrieveAdjustmentTypeList.getInstance()
        };
    },
    getters: {
        staffOptions(state): StaffOption[] {
            return state.staff.map((s) => ({
                id: s.staffId,
                name: s.staffName ?? [s.firstName, s.lastName].filter(Boolean).join(" ")
            }));
        },
        typeOptions(state): AdjustmentTypeOption[] {
            // Backend may name the id field typeId or id; alias both.
            return state.types.map((t) => ({
                id: t.typeId ?? t.id ?? t.adjustmentTypeId,
                name: t.name ?? t.typeName,
                category: t.category
            }));
        },
        canConfirm(state): boolean {
            return !!state.staffId && !!state.typeId && Number(state.amount ?? 0) > 0 && !!state.effectiveMonth;
        }
    },
    actions: {
        loadStaff() {
            this.loadingStaff = true;
            this.staffApi.request({
                dataBody: { pageNo: 1, pageSize: 200 },
                listener: {
                    onSuccess: (p: { staffList?: StaffLookup[] }) => { this.staff = p.staffList ?? []; this.loadingStaff = false; },
                    onFail: () => { this.loadingStaff = false; }
                }
            });
        },
        loadTypes() {
            this.loadingTypes = true;
            this.typeApi.request({
                dataBody: { manualOnly: true },
                listener: {
                    onSuccess: (p: { typeList?: AdjustmentType[] }) => { this.types = p.typeList ?? []; this.loadingTypes = false; },
                    onFail: () => { this.loadingTypes = false; }
                }
            });
        },
        onPickType() { /* selection reflected via typeOptions lookup on confirm */ },
        /** Validate + stash the PRM draft; returns true when saved (screen then navigates). */
        buildAndSaveDraft(): boolean {
            if (!this.canConfirm) return false;
            const staff = this.staffOptions.find((s) => s.id === this.staffId);
            const type = this.typeOptions.find((t) => t.id === this.typeId);
            ModuleFlowStore.saveDraft("PRM", {
                payload: {
                    staffId: this.staffId,
                    adjustmentTypeId: this.typeId,
                    amount: this.amount,
                    effectiveMonth: this.effectiveMonth,
                    remark: this.remark || undefined
                },
                idempotencyKey: crypto.randomUUID(),
                display: {
                    staffName: staff?.name ?? "",
                    typeName: type?.name ?? "",
                    category: type?.category ?? "",
                    amount: Number(this.amount ?? 0),
                    month: this.effectiveMonth,
                    remark: this.remark
                }
            });
            return true;
        }
    }
});
