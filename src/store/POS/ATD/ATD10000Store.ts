import { defineStore } from "pinia";
import RetrieveAttendanceList from "@/services/api/ATD/retrieveAttendanceList";
import RetrieveAttendanceSummary from "@/services/api/ATD/retrieveAttendanceSummary";
import type { AttendanceRow, AttendanceSummaryRow, AttendanceFilter, ATD10000Response, ATD15000Response } from "@/models/POS/ATD/ATD10000";

function today(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** ATD10000 attendance-list store: filter state + list/summary api calls. */
export const ATD10000Store = defineStore("ATD10000Store", {
    state: () => ({
        dateRange: [today(), today()] as [string, string] | null,
        status: undefined as string | undefined,
        statuses: ["PRESENT", "LATE", "ABSENT", "HALF_DAY", "ON_LEAVE", "HOLIDAY"],
        rows: [] as AttendanceRow[],
        summary: [] as AttendanceSummaryRow[],
        summaryTotal: 0,
        loading: false,
        total: 0,
        pageNo: 1,
        pageSize: 10,
        listApi: RetrieveAttendanceList.getInstance(),
        summaryApi: RetrieveAttendanceSummary.getInstance()
    }),
    getters: {
        filterBody(state): AttendanceFilter {
            return {
                startDate: state.dateRange?.[0],
                endDate: state.dateRange?.[1],
                status: state.status
            };
        }
    },
    actions: {
        reload() {
            this.loading = true;
            this.listApi.request({
                dataBody: { pageNo: this.pageNo, pageSize: this.pageSize, ...this.filterBody },
                listener: {
                    onSuccess: (p: ATD10000Response) => {
                        this.rows = p.attendanceList ?? [];
                        this.total = p.totalCount ?? 0;
                        this.loading = false;
                    },
                    onFail: () => { this.rows = []; this.total = 0; this.loading = false; }
                }
            });
            this.summaryApi.request({
                dataBody: { ...this.filterBody },
                listener: {
                    onSuccess: (p: ATD15000Response) => {
                        this.summary = p.summary ?? [];
                        this.summaryTotal = p.total ?? 0;
                    },
                    onFail: () => { this.summary = []; this.summaryTotal = 0; }
                }
            });
        },
        onFilter() {
            this.pageNo = 1;
            this.reload();
        },
        setPage(pageNo: number, pageSize: number) {
            this.pageNo = pageNo;
            this.pageSize = pageSize;
            this.reload();
        }
    }
});
