import { defineStore } from "pinia";
import RetrieveRoleList from "@/services/api/ADM/retrieveRoleList";
import RetrieveStaffList from "@/services/api/STM/retrieveStaffList";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";
import type { StaffLookup } from "@/models/POS/COMMON/lookups";
import type { RoleOption } from "@/models/POS/ADM/ADM11000";

/** ADM11000 user-create form store: role/staff lookups + non-secret form + draft handoff.
 * The password never lives here — it stays in UserCreateSecret in the component. */
export const ADM11000Store = defineStore("ADM11000Store", {
    state: () => ({
        form: {
            username: "",
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            roleId: undefined as string | undefined,
            staffId: undefined as string | undefined
        },
        roles: [] as RoleOption[],
        staff: [] as StaffLookup[],
        roleApi: RetrieveRoleList.getInstance(),
        staffApi: RetrieveStaffList.getInstance()
    }),
    getters: {
        /** Non-secret form validity — the password/confirm check stays in the component. */
        formValid(state): boolean {
            return !!state.form.username && !!state.form.firstName && !!state.form.lastName && !!state.form.roleId;
        }
    },
    actions: {
        staffLabel(s: StaffLookup): string {
            return s.staffName ?? `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim();
        },
        loadRoles() {
            this.roleApi.request({
                dataBody: { pageNo: 1, pageSize: 100 },
                listener: { onSuccess: (p) => { this.roles = p.roleList ?? []; } }
            });
        },
        loadStaff() {
            this.staffApi.request({
                dataBody: { pageNo: 1, pageSize: 200 },
                listener: { onSuccess: (p) => { this.staff = p.staffList ?? []; } }
            });
        },
        /** Validate + stash the ADM user draft; `emailAuto` is the already-translated
         * placeholder for a blank email. Returns true when saved (screen then navigates). */
        buildAndSaveDraft(emailAuto: string): boolean {
            if (!this.formValid) return false;
            const role = this.roles.find((r) => r.roleId === this.form.roleId);
            const staffRow = this.staff.find((s) => s.staffId === this.form.staffId);
            ModuleFlowStore.saveDraft("ADM", {
                payload: { ...this.form, loginUsername: this.form.username },
                idempotencyKey: crypto.randomUUID(),
                display: {
                    name: `${this.form.firstName} ${this.form.lastName}`,
                    username: this.form.username,
                    email: this.form.email || emailAuto,
                    phone: this.form.phone,
                    roleName: role?.roleName ?? this.form.roleId,
                    staffName: staffRow ? this.staffLabel(staffRow) : ""
                }
            });
            return true;
        }
    }
});
