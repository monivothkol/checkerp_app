import { defineStore } from "pinia";
import POP from "@/core/utilities/pop";
import RetrieveRoleDetail from "@/services/api/ADM/retrieveRoleDetail";
import RetrievePermissionCatalog from "@/services/api/ADM/retrievePermissionCatalog";
import UpdateRole from "@/services/api/ADM/updateRole";

interface Perm { permissionCode: string; permissionName: string; resource: string; action: string; }
interface Group { resource: string; items: Perm[]; }

/** ADM25000 role-edit store: loads the role + grantable catalog, edits the selection,
 * and saves (POP.alert on both outcomes; redirectTo for the screen to navigate). */
export const ADM25000Store = defineStore("ADM25000Store", {
    state: () => ({
        loading: true,
        saving: false,
        // System roles are global: only THIS company's permissions are editable,
        // the shared name/description stay read-only.
        isSystemRole: false,
        form: { roleName: "", description: "" } as Record<string, string>,
        permError: false,
        groups: [] as Group[],
        grantableCodes: [] as string[],
        currentCodes: [] as string[],
        selected: [] as string[],
        idempotencyKey: crypto.randomUUID(),
        redirectTo: null as string | null,
        roleDetailApi: RetrieveRoleDetail.getInstance(),
        permApi: RetrievePermissionCatalog.getInstance(),
        updateApi: UpdateRole.getInstance()
    }),
    getters: {
        // Current permissions the editor cannot grant → kept server-side, shown as a note.
        lockedCount(state): number {
            return state.currentCodes.filter((c) => !state.grantableCodes.includes(c)).length;
        }
    },
    actions: {
        loadAll(roleCode: string) {
            this.loading = true;
            // 1) role detail (current name/desc/perms), 2) grantable catalog.
            this.roleDetailApi.request({
                dataBody: { roleCode },
                listener: {
                    onSuccess: (role) => {
                        this.isSystemRole = role.isSystemRole ?? false;
                        this.form.roleName = role.roleName ?? "";
                        this.form.description = role.description ?? "";
                        this.currentCodes = (role.permissionList ?? []).map((p: Perm) => p.permissionCode);
                        this.loadCatalog();
                    },
                    onFail: () => { this.loading = false; }
                }
            });
        },
        loadCatalog() {
            this.permApi.request({
                dataBody: {},
                listener: {
                    onSuccess: (p) => {
                        const list: Perm[] = p.permissionList ?? [];
                        this.grantableCodes = list.map((x) => x.permissionCode);
                        const byResource: Record<string, Perm[]> = {};
                        for (const perm of list) {
                            byResource[perm.resource] ??= [];
                            byResource[perm.resource].push(perm);
                        }
                        this.groups = Object.keys(byResource)
                            .sort((a, b) => a.localeCompare(b))
                            .map((resource) => ({ resource, items: byResource[resource] }));
                        // Pre-select the role's current permissions that ARE grantable (lockable ones stay server-side).
                        this.selected = this.currentCodes.filter((c) => this.grantableCodes.includes(c));
                        this.loading = false;
                    },
                    onFail: () => { this.loading = false; }
                }
            });
        },
        isGroupAll(g: Group): boolean { return g.items.every((i) => this.selected.includes(i.permissionCode)); },
        isGroupSome(g: Group): boolean {
            const n = g.items.filter((i) => this.selected.includes(i.permissionCode)).length;
            return n > 0 && n < g.items.length;
        },
        toggleOne(code: string) {
            const i = this.selected.indexOf(code);
            if (i >= 0) this.selected.splice(i, 1); else this.selected.push(code);
        },
        toggleGroup(g: Group) {
            const codes = g.items.map((i) => i.permissionCode);
            if (this.isGroupAll(g)) this.selected = this.selected.filter((c) => !codes.includes(c));
            else this.selected = Array.from(new Set([...this.selected, ...codes]));
        },
        selectAll() { this.selected = this.groups.flatMap((g) => g.items.map((i) => i.permissionCode)); },
        clearAll() { this.selected = []; },
        /** Validate the picker + save the role update. Titles are already-translated (i18n stays in screen).
         * POP.alert on both outcomes; sets redirectTo on success. */
        save(roleCode: string, savedTitle: string, savedMsg: string, failTitle: string) {
            // A role with only locked (server-side) perms is still valid.
            this.permError = this.selected.length === 0 && this.lockedCount === 0;
            if (this.permError) return;
            this.saving = true;
            this.updateApi.request({
                dataBody: {
                    roleCode,
                    roleName: this.form.roleName,
                    description: this.form.description || undefined,
                    permissionCodes: this.selected
                },
                headers: { "Idempotency-Key": this.idempotencyKey },
                listener: {
                    onSuccess: () => {
                        this.saving = false;
                        POP.alert({ title: savedTitle, status: "success", content: savedMsg });
                        this.redirectTo = `/ADM24000?roleCode=${roleCode}`;
                    },
                    onFail: (error) => {
                        this.saving = false;
                        POP.alert({ title: failTitle, status: "error", content: error?.message || "Please try again.", errorCode: error?.code });
                    }
                }
            });
        }
    }
});
