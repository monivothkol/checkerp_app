import { defineStore } from "pinia";
import RetrieveLeaveTypeList from "@/services/api/LVM/retrieveLeaveTypeList";
import DeleteLeaveType from "@/services/api/LVM/deleteLeaveType";
import RestoreLeaveType from "@/services/api/LVM/restoreLeaveType";
import type { LeaveType } from "@/models/POS/LVM/LVM20000";

type ActDone = (ok: boolean, error?: unknown) => void;

/** LVM20000 leave-type list store: active/inactive list load + soft delete/restore. */
export const LVM20000Store = defineStore("LVM20000Store", {
    state: () => ({
        rows: [] as LeaveType[],
        loading: false,
        showInactive: false,
        acting: false,
        typeApi: RetrieveLeaveTypeList.getInstance(),
        deleteApi: DeleteLeaveType.getInstance(),
        restoreApi: RestoreLeaveType.getInstance()
    }),
    actions: {
        reload() {
            this.loading = true;
            this.typeApi.request({
                dataBody: this.showInactive ? { isActive: false } : {},
                listener: {
                    onSuccess: (p) => { this.rows = p.typeList ?? []; this.loading = false; },
                    onFail: () => { this.rows = []; this.loading = false; }
                }
            });
        },
        setShowInactive(v: boolean) {
            this.showInactive = v;
            this.reload();
        },
        remove(leaveTypeId: string, done: ActDone) {
            this.acting = true;
            this.deleteApi.request({
                dataBody: { leaveTypeId },
                listener: {
                    onSuccess: () => { this.acting = false; this.reload(); done(true); },
                    onFail: (e) => { this.acting = false; done(false, e); }
                }
            });
        },
        restore(leaveTypeId: string, done: ActDone) {
            this.acting = true;
            this.restoreApi.request({
                dataBody: { leaveTypeId },
                listener: {
                    onSuccess: () => { this.acting = false; this.reload(); done(true); },
                    onFail: (e) => { this.acting = false; done(false, e); }
                }
            });
        }
    }
});
