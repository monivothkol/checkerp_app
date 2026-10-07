import { defineStore } from "pinia";
import RetrieveRoleDetail from "@/services/api/ADM/retrieveRoleDetail";
import type { RoleDetail, RolePermission } from "@/models/POS/ADM/ADM20000";

/** ADM24000 role-detail screen store: detail load by role code + grouped permissions. */
export const ADM24000Store = defineStore("ADM24000Store", {
    state: () => ({
        loading: true,
        role: null as RoleDetail | null,
        roleDetailApi: RetrieveRoleDetail.getInstance()
    }),
    getters: {
        groupedPermissions(state): { resource: string; items: RolePermission[] }[] {
            const list: RolePermission[] = state.role?.permissionList ?? [];
            const byResource: Record<string, RolePermission[]> = {};
            for (const p of list) {
                byResource[p.resource] ??= [];
                byResource[p.resource].push(p);
            }
            return Object.keys(byResource)
                .sort((a, b) => a.localeCompare(b))
                .map((resource) => ({ resource, items: byResource[resource] }));
        }
    },
    actions: {
        load(code: string) {
            if (!code) { this.loading = false; return; }
            this.loading = true;
            this.roleDetailApi.request({
                dataBody: { roleCode: code },
                listener: {
                    onSuccess: (p) => { this.role = p; this.loading = false; },
                    onFail: () => { this.role = null; this.loading = false; }
                }
            });
        }
    }
});
