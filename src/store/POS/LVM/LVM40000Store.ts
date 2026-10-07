import { defineStore } from "pinia";
import RetrieveStaffList from "@/services/api/STM/retrieveStaffList";
import RetrieveLeaveBalances from "@/services/api/LVM/retrieveLeaveBalances";
import RetrieveLeaveSummary from "@/services/api/LVM/retrieveLeaveSummary";
import { loadStaffOptions, toStaffOptions } from "@/store/POS/COMMON/staffOptionsSupport";
import type { StaffLookup } from "@/models/POS/COMMON/lookups";
import type { LeaveBalance, LeaveSummaryRow } from "@/models/POS/LVM/LVM40000";

/**
 * LVM40000 leave balances + summary store. A staff must be picked to load their
 * per-year balances (auto-initialized server-side); the summary is company-wide
 * for the year, or scoped to the picked staff.
 */
export const LVM40000Store = defineStore("LVM40000Store", {
    state: () => ({
        year: new Date().getFullYear(),
        staffId: undefined as string | undefined,
        staff: [] as StaffLookup[],
        loadingStaff: false,
        balances: [] as LeaveBalance[],
        summary: [] as LeaveSummaryRow[],
        loadingBalances: false,
        loadingSummary: false,
        staffApi: RetrieveStaffList.getInstance(),
        balanceApi: RetrieveLeaveBalances.getInstance(),
        summaryApi: RetrieveLeaveSummary.getInstance()
    }),
    getters: {
        staffOptions(state): { id: string; name: string }[] {
            return toStaffOptions(state.staff);
        }
    },
    actions: {
        loadStaff() {
            loadStaffOptions(this, this.staffApi);
        },
        loadBalances() {
            if (!this.staffId) { this.balances = []; return; }
            this.loadingBalances = true;
            this.balanceApi.request({
                dataBody: { staffId: this.staffId, year: this.year },
                listener: {
                    onSuccess: (p) => { this.balances = p.balanceList ?? []; this.loadingBalances = false; },
                    onFail: () => { this.balances = []; this.loadingBalances = false; }
                }
            });
        },
        loadSummary() {
            this.loadingSummary = true;
            this.summaryApi.request({
                dataBody: { year: this.year, staffId: this.staffId },
                listener: {
                    onSuccess: (p) => { this.summary = p.summaryList ?? []; this.loadingSummary = false; },
                    onFail: () => { this.summary = []; this.loadingSummary = false; }
                }
            });
        },
        reload() {
            this.loadBalances();
            this.loadSummary();
        },
        onStaffChange() {
            this.reload();
        },
        onYearChange(year: number) {
            this.year = year;
            this.reload();
        }
    }
});
