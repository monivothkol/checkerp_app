import { defineStore } from "pinia";
import RetrieveStaffList from "@/services/api/STM/retrieveStaffList";
import RetrieveLeaveRequestList from "@/services/api/LVM/retrieveLeaveRequestList";
import RetrievePendingApprovals from "@/services/api/LVM/retrievePendingApprovals";
import type { StaffLookup } from "@/models/POS/COMMON/lookups";
import type { LeaveRequestRow } from "@/models/POS/LVM/LVM10000";

/** LVM10000 leave-request list store: staff/status filters + list & staff api calls. */
export const LVM10000Store = defineStore("LVM10000Store", {
    state: () => ({
        mode: "all" as "all" | "inbox",
        staffId: undefined as string | undefined,
        status: undefined as string | undefined,
        statuses: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
        staff: [] as StaffLookup[],
        loadingStaff: false,
        rows: [] as LeaveRequestRow[],
        loading: false,
        total: 0,
        pageNo: 1,
        pageSize: 10,
        staffApi: RetrieveStaffList.getInstance(),
        listApi: RetrieveLeaveRequestList.getInstance(),
        pendingApi: RetrievePendingApprovals.getInstance()
    }),
    getters: {
        staffOptions(state): { id: string; name: string }[] {
            return state.staff.map((s) => ({
                id: s.staffId,
                name: s.staffName ?? [s.firstName, s.lastName].filter(Boolean).join(" ")
            }));
        }
    },
    actions: {
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
        reload() {
            if (this.mode === "inbox") { this.loadInbox(); return; }
            this.loading = true;
            this.listApi.request({
                dataBody: { pageNo: this.pageNo, pageSize: this.pageSize, staffId: this.staffId, status: this.status },
                listener: {
                    onSuccess: (p) => {
                        this.rows = p.requestList ?? [];
                        this.total = p.totalCount ?? 0;
                        this.loading = false;
                    },
                    onFail: () => { this.rows = []; this.total = 0; this.loading = false; }
                }
            });
        },
        // "My approvals" inbox: PENDING requests awaiting the caller (not paged).
        loadInbox() {
            this.loading = true;
            this.pendingApi.request({
                dataBody: {},
                listener: {
                    onSuccess: (p) => {
                        this.rows = p.requestList ?? [];
                        this.total = this.rows.length;
                        this.loading = false;
                    },
                    onFail: () => { this.rows = []; this.total = 0; this.loading = false; }
                }
            });
        },
        setMode(mode: "all" | "inbox") {
            this.mode = mode;
            this.pageNo = 1;
            this.reload();
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
