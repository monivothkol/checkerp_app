import { defineStore } from "pinia";
import RetrieveAttendanceDetail from "@/services/api/ATD/retrieveAttendanceDetail";
import type { AttendanceDetail } from "@/models/POS/ATD/ATD10000";

/** ATD14000 attendance-detail store: detail load by attendanceId. */
export const ATD14000Store = defineStore("ATD14000Store", {
    state: () => ({
        loading: true,
        detail: null as AttendanceDetail | null,
        detailApi: RetrieveAttendanceDetail.getInstance()
    }),
    actions: {
        load(attendanceId: string) {
            if (!attendanceId) { this.loading = false; return; }
            this.loading = true;
            this.detailApi.request({
                dataBody: { attendanceId },
                listener: {
                    // Record may come nested under `attendance` or flat on the payload.
                    onSuccess: (p) => { this.detail = p.attendance ?? p; this.loading = false; },
                    onFail: () => { this.detail = null; this.loading = false; }
                }
            });
        }
    }
});
