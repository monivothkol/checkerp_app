import { defineStore } from "pinia";
import RetrieveAttendanceList from "@/services/api/ATD/retrieveAttendanceList";
import RetrieveAttendanceSummary from "@/services/api/ATD/retrieveAttendanceSummary";
import RecordAbsenceLeave from "@/services/api/ATD/recordAbsenceLeave";
import RetrieveLeaveTypeList from "@/services/api/LVM/retrieveLeaveTypeList";
import RetrieveLeaveBalances from "@/services/api/LVM/retrieveLeaveBalances";
import type { LeaveType, LVM20000Response } from "@/models/POS/LVM/LVM20000";
import type { LeaveBalance, LeaveBalanceResponse } from "@/models/POS/LVM/LVM40000";
import POP from "@/core/utilities/pop";
import type { AttendanceRow, AttendanceSummaryRow, AttendanceFilter, ATD10000Response, ATD15000Response, LeaveOption } from "@/models/POS/ATD/ATD10000";

function today(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** ATD10000 attendance-list store: filter state + list/summary api calls. */
export const ATD10000Store = defineStore("ATD10000Store", {
    state: () => ({
        dateRange: [today(), today()] as [string, string] | null,
        status: undefined as string | undefined,
        statuses: ["PRESENT", "LATE", "ABSENT", "HALF_DAY", "ON_LEAVE", "HOLIDAY", "DAY_OFF", "NOT_SCANNED"],
        rows: [] as AttendanceRow[],
        summary: [] as AttendanceSummaryRow[],
        summaryTotal: 0,
        loading: false,
        total: 0,
        pageNo: 1,
        pageSize: 10,
        /** Not scanned rows ticked for "Record as leave". */
        selectedIds: [] as string[],
        recording: false,
        listApi: RetrieveAttendanceList.getInstance(),
        recordApi: RecordAbsenceLeave.getInstance(),
        typeApi: RetrieveLeaveTypeList.getInstance(),
        balanceApi: RetrieveLeaveBalances.getInstance(),
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
            this.selectedIds = [];
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
        /** Active leave types, with the remaining balance when every picked row is the same staff. */
        loadLeaveOptions(picked: AttendanceRow[]): Promise<LeaveOption[]> {
            const staffIds = [...new Set(picked.map((r) => r.staffId))];
            const staffId = staffIds.length === 1 ? staffIds[0] : undefined;
            const year = Number(String(picked[0]?.date ?? "").slice(0, 4)) || new Date().getFullYear();
            const types = new Promise<LeaveType[]>((resolve) => this.typeApi.request({
                dataBody: {},
                listener: { onSuccess: (p: LVM20000Response) => resolve(p.typeList ?? []), onFail: () => resolve([]) }
            }));
            const balances = staffId ? new Promise<LeaveBalance[]>((resolve) => this.balanceApi.request({
                dataBody: { staffId, year },
                listener: { onSuccess: (p: LeaveBalanceResponse) => resolve(p.balanceList ?? []), onFail: () => resolve([]) }
            })) : Promise.resolve([] as LeaveBalance[]);
            return Promise.all([types, balances]).then(([t, b]) => t
                .filter((x) => x.isActive !== false)
                .map((x) => ({
                    leaveTypeId: x.leaveTypeId,
                    name: x.name,
                    isPaid: x.isPaid !== false,
                    // Unpaid leave has no allowance, so no balance to show or check.
                    remainingDays: x.isPaid === false ? undefined : b.find((r) => r.leaveTypeId === x.leaveTypeId)?.remainingDays
                })));
        },
        recordLeave(leaveTypeId: string, failTitle: string, onDone?: () => void) {
            if (this.recording || !this.selectedIds.length) return;
            this.recording = true;
            this.recordApi.request({
                dataBody: { attendanceIds: this.selectedIds, leaveTypeId },
                headers: { "Idempotency-Key": crypto.randomUUID() },
                listener: {
                    onSuccess: () => { this.recording = false; this.reload(); onDone?.(); },
                    onFail: (e) => {
                        this.recording = false;
                        POP.alert({ status: "error", title: failTitle, content: e?.message, errorCode: e?.code });
                    }
                }
            });
        },
        setPage(pageNo: number, pageSize: number) {
            this.pageNo = pageNo;
            this.pageSize = pageSize;
            this.reload();
        }
    }
});
