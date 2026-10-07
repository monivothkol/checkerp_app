import { defineStore } from "pinia";
import RetrieveScheduleDetail from "@/services/api/ATD/retrieveScheduleDetail";
import type { ScheduleRow, ScheduleAssignment } from "@/models/POS/ATD/ATD30000";

/** ATD34000 schedule-detail store: schedule + assignment load by scheduleId. */
export const ATD34000Store = defineStore("ATD34000Store", {
    state: () => ({
        loading: true,
        schedule: null as ScheduleRow | null,
        assignments: [] as ScheduleAssignment[],
        detailApi: RetrieveScheduleDetail.getInstance()
    }),
    actions: {
        load(scheduleId: string) {
            if (!scheduleId) { this.loading = false; return; }
            this.loading = true;
            this.detailApi.request({
                dataBody: { scheduleId },
                listener: {
                    onSuccess: (p) => {
                        // Schedule may come nested (p.schedule) or flat alongside assignments.
                        this.schedule = p.schedule ?? p;
                        this.assignments = p.assignments ?? p.assignmentList ?? [];
                        this.loading = false;
                    },
                    onFail: () => { this.schedule = null; this.assignments = []; this.loading = false; }
                }
            });
        }
    }
});
