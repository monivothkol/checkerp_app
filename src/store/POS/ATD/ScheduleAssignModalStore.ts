import { defineStore } from "pinia";
import POP from "@/core/utilities/pop";
import RetrieveStaffList from "@/services/api/STM/retrieveStaffList";
import AssignSchedule from "@/services/api/ATD/assignSchedule";
import type { StaffLookup } from "@/models/POS/COMMON/lookups";

function today(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Store for the schedule-assign modal (ATD35000): staff lookup + assignment save (one or many staff). */
export const ScheduleAssignModalStore = defineStore("ScheduleAssignModalStore", {
    state: () => ({
        saving: false,
        loadingStaff: false,
        saved: false,
        staff: [] as StaffLookup[],
        /** Several staff can be assigned in one go. */
        staffIds: [] as string[],
        effectiveFrom: today() as string | undefined,
        effectiveTo: undefined as string | undefined,
        staffApi: RetrieveStaffList.getInstance(),
        assignApi: AssignSchedule.getInstance()
    }),
    getters: {
        staffOptions(state): { id: string; name: string }[] {
            return state.staff.map((s) => ({
                id: s.staffId,
                name: s.staffName ?? [s.firstName, s.lastName].filter(Boolean).join(" ")
            }));
        },
        canSave(state): boolean {
            return state.staffIds.length > 0 && !!state.effectiveFrom;
        }
    },
    actions: {
        /** Reset the form (store is a singleton reused across modal opens) then load staff. */
        init() {
            this.saving = false;
            this.saved = false;
            this.staffIds = [];
            this.effectiveFrom = today();
            this.effectiveTo = undefined;
            this.loadStaff();
        },
        loadStaff() {
            this.loadingStaff = true;
            this.staffApi.request({
                dataBody: { pageNo: 1, pageSize: 200 },
                listener: {
                    onSuccess: (p) => { this.staff = p.staffList ?? []; this.loadingStaff = false; },
                    onFail: () => { this.loadingStaff = false; }
                }
            });
        },
        /** Save the assignment; on success sets `saved` (modal watches it to $emit ok). */
        save(scheduleId: string, failTitle: string) {
            if (!this.canSave || this.saving) return;
            this.saving = true;
            this.assignApi.request({
                dataBody: {
                    staffIds: this.staffIds,
                    scheduleId,
                    effectiveFrom: this.effectiveFrom,
                    effectiveTo: this.effectiveTo || undefined
                },
                listener: {
                    onSuccess: () => {
                        this.saving = false;
                        this.saved = true;
                    },
                    onFail: (error: { message?: string; code?: string }) => {
                        this.saving = false;
                        POP.alert({ title: failTitle, status: "error", content: error?.message ?? "", errorCode: error?.code });
                    }
                }
            });
        }
    }
});
