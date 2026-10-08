import { defineStore } from "pinia";
import RetrieveStaffList from "@/services/api/STM/retrieveStaffList";
import RetrieveLeaveTypeList from "@/services/api/LVM/retrieveLeaveTypeList";
import RetrieveLeaveDaysPreview from "@/services/api/LVM/retrieveLeaveDaysPreview";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";
import type { StaffLookup } from "@/models/POS/COMMON/lookups";
import type { LeaveType } from "@/models/POS/LVM/LVM20000";

interface Approver {
    value: string; // staffId
    name: string;
}

/** LVM11000 create-leave-request form store: lookups, approval-line building, draft handoff to LVM12000. */
export const LVM11000Store = defineStore("LVM11000Store", {
    state: () => ({
        staff: [] as StaffLookup[],
        loadingStaff: false,
        types: [] as LeaveType[],
        loadingTypes: false,
        staffId: undefined as string | undefined,
        leaveTypeId: undefined as string | undefined,
        dateRange: [] as string[],
        isHalfDay: false,
        reason: "",
        approvers: [] as Approver[],
        approverPick: undefined as string | undefined,
        followerStaffIds: [] as string[],
        /** Days the server counts for this staff + range (their fixed days off excluded); null until known. */
        serverDays: null as number | null,
        daysSeq: 0,
        staffApi: RetrieveStaffList.getInstance(),
        typeApi: RetrieveLeaveTypeList.getInstance()
    }),
    getters: {
        staffOptions(state): { id: string; name: string }[] {
            return state.staff.map((s) => ({
                id: s.staffId,
                name: s.staffName ?? [s.firstName, s.lastName].filter(Boolean).join(" ")
            }));
        },
        startDate(state): string {
            return state.dateRange?.[0] ?? "";
        },
        endDate(state): string {
            return state.dateRange?.[1] ?? "";
        },
        /** Server count when known (fixed days off excluded), else the calendar count while it loads. */
        totalDays(state): number {
            if (state.serverDays != null) return state.serverDays;
            const start = state.dateRange?.[0] ?? "";
            const end = state.dateRange?.[1] ?? "";
            if (!start || !end) return 0;
            if (state.isHalfDay) return 0.5;
            const from = Date.parse(start);
            const to = Date.parse(end);
            if (!Number.isFinite(from) || !Number.isFinite(to) || to < from) return 0;
            return Math.round((to - from) / 86400000) + 1;
        },
        canConfirm(): boolean {
            return !!this.leaveTypeId && !!this.startDate && !!this.endDate && this.totalDays > 0;
        }
    },
    actions: {
        staffName(staffId: string): string {
            return this.staffOptions.find((s) => s.id === staffId)?.name ?? staffId;
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
        loadTypes() {
            this.loadingTypes = true;
            this.typeApi.request({
                dataBody: {},
                listener: {
                    onSuccess: (p) => { this.types = p.typeList ?? []; this.loadingTypes = false; },
                    onFail: () => { this.loadingTypes = false; }
                }
            });
        },
        onDatesChange() {
            if (this.isHalfDay && this.startDate) this.dateRange = [this.startDate, this.startDate];
            this.refreshDays();
        },
        onHalfDayToggle(checked: boolean) {
            this.isHalfDay = checked;
            if (checked && this.startDate) this.dateRange = [this.startDate, this.startDate];
            this.refreshDays();
        },
        /** Ask the server how many days the request takes (it skips the staff's fixed days off). Latest call wins. */
        refreshDays() {
            this.serverDays = null;
            if (!this.startDate || !this.endDate) return;
            const seq = ++this.daysSeq;
            RetrieveLeaveDaysPreview.getInstance().request({
                dataBody: { staffId: this.staffId, startDate: this.startDate, endDate: this.endDate, isHalfDay: this.isHalfDay },
                listener: {
                    onSuccess: (p) => { if (seq === this.daysSeq) this.serverDays = Number(p.totalDays ?? 0); },
                    onFail: () => { /* keep the calendar estimate; the server still counts on submit */ }
                }
            });
        },
        onPickApprover(staffId: string) {
            this.approverPick = undefined;
            if (!staffId || this.approvers.some((a) => a.value === staffId)) return;
            this.approvers.push({ value: staffId, name: this.staffName(staffId) });
        },
        removeApprover(i: number) {
            this.approvers.splice(i, 1);
        },
        moveApprover(i: number, dir: number) {
            const j = i + dir;
            if (j < 0 || j >= this.approvers.length) return;
            const [a] = this.approvers.splice(i, 1);
            this.approvers.splice(j, 0, a);
        },
        /** Validate + stash the LVM draft; `myselfLabel` fills the display staff name when acting for self. Returns true when saved. */
        buildAndSaveDraft(myselfLabel: string): boolean {
            if (!this.canConfirm) return false;
            const type = this.types.find((t) => t.leaveTypeId === this.leaveTypeId);
            ModuleFlowStore.saveDraft("LVM", {
                payload: {
                    staffId: this.staffId || undefined,
                    leaveTypeId: this.leaveTypeId,
                    startDate: this.startDate,
                    endDate: this.endDate,
                    isHalfDay: this.isHalfDay,
                    reason: this.reason.trim() || undefined,
                    approverStaffIds: this.approvers.map((a) => a.value),
                    followerStaffIds: this.followerStaffIds
                },
                idempotencyKey: crypto.randomUUID(),
                display: {
                    staffName: this.staffId ? this.staffName(this.staffId) : myselfLabel,
                    typeName: type?.name ?? "",
                    startDate: this.startDate,
                    endDate: this.endDate,
                    isHalfDay: this.isHalfDay,
                    days: this.totalDays,
                    approvers: this.approvers.map((a) => a.name),
                    followers: this.followerStaffIds.map((id) => this.staffName(id)),
                    reason: this.reason.trim()
                }
            });
            return true;
        }
    }
});
