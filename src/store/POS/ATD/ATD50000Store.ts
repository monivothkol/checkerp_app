import { defineStore } from "pinia";
import RetrieveAttendanceRules from "@/services/api/ATD/retrieveAttendanceRules";
import SaveAttendanceRules from "@/services/api/ATD/saveAttendanceRules";
import POP from "@/core/utilities/pop";
import type { AttendanceLateRule } from "@/models/POS/ATD/ATD50000";

/** Already-translated alert titles the screen hands to save() (i18n stays in the screen). */
export interface ATD50000SaveTitles {
    savedTitle: string;
    savedMsg: string;
    failTitle: string;
}

/** ATD50000 attendance-rules store: working days/month, day deductions (absent / missing punch / unpaid leave) + late tiers. */
export const ATD50000Store = defineStore("ATD50000Store", {
    state: () => ({
        loading: true,
        saving: false,
        form: {
            workingDaysPerMonth: undefined as number | undefined,
            absentDeductionDays: undefined as number | undefined,
            missingMorningDeductionDays: undefined as number | undefined,
            missingAfternoonDeductionDays: undefined as number | undefined,
            missingFulldayDeductionDays: undefined as number | undefined,
            unpaidLeaveDeductionPerDay: undefined as number | undefined,
            /** Nightly marking of no-scan days (Day off / Not scanned / On leave); off by default. */
            autoMarkDays: false
        },
        lateRules: [] as AttendanceLateRule[],
        loadApi: RetrieveAttendanceRules.getInstance(),
        saveApi: SaveAttendanceRules.getInstance()
    }),
    actions: {
        load() {
            this.loading = true;
            this.loadApi.request({
                dataBody: {},
                listener: {
                    onSuccess: (p) => {
                        this.form.workingDaysPerMonth = p.workingDaysPerMonth;
                        this.form.absentDeductionDays = p.absentDeductionDays;
                        this.form.missingMorningDeductionDays = p.missingMorningDeductionDays;
                        this.form.missingAfternoonDeductionDays = p.missingAfternoonDeductionDays;
                        this.form.missingFulldayDeductionDays = p.missingFulldayDeductionDays;
                        this.form.unpaidLeaveDeductionPerDay = p.unpaidLeaveDeductionPerDay;
                        this.form.autoMarkDays = !!p.autoMarkDays;
                        this.lateRules = p.lateRules ?? [];
                        this.loading = false;
                    },
                    onFail: () => { this.loading = false; }
                }
            });
        },
        /** Persist the rules; `titles` are already-translated alert strings. */
        save(titles: ATD50000SaveTitles) {
            if (this.saving) return;
            this.saving = true;
            // Half-filled tier rows are dropped rather than rejected server-side.
            const lateRules = this.lateRules.filter((r) => r.thresholdCount != null && r.deductionDays != null);
            this.saveApi.request({
                dataBody: { ...this.form, lateRules },
                listener: {
                    onSuccess: () => {
                        this.saving = false;
                        POP.alert({ title: titles.savedTitle, status: "success", content: titles.savedMsg });
                        this.load();
                    },
                    onFail: (err: { message?: string; code?: string }) => {
                        this.saving = false;
                        POP.alert({ title: titles.failTitle, status: "error", content: err?.message ?? "", errorCode: err?.code });
                    }
                }
            });
        },
        addLateRule() {
            this.lateRules.push({ thresholdCount: undefined, deductionDays: undefined });
        },
        removeLateRule(index: number) {
            this.lateRules.splice(index, 1);
        }
    }
});
