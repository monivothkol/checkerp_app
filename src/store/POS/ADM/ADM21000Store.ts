import { defineStore } from "pinia";
import RetrievePermissionCatalog from "@/services/api/ADM/retrievePermissionCatalog";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";

interface Perm { permissionCode: string; permissionName: string; resource: string; action: string; }
interface Group { resource: string; items: Perm[]; }

/** ADM21000 role-create form store: permission catalog + selection + draft handoff to ADM22000. */
export const ADM21000Store = defineStore("ADM21000Store", {
    state: () => ({
        form: { roleName: "", description: "" } as Record<string, string>,
        permError: false,
        loadingPerms: true,
        groups: [] as Group[],
        selected: [] as string[],
        permApi: RetrievePermissionCatalog.getInstance()
    }),
    actions: {
        /** Restore a prior ADMR draft (back-nav from confirm), if any. */
        restoreDraft() {
            const draft = ModuleFlowStore.loadDraft("ADMR");
            if (draft?.form) { this.form = draft.form; this.selected = draft.selected ?? []; }
        },
        clearDraft() {
            ModuleFlowStore.clearDraft("ADMR");
        },
        loadPermissions() {
            this.loadingPerms = true;
            // ADM26000 returns ONLY the permissions this user is allowed to grant.
            this.permApi.request({
                dataBody: {},
                listener: {
                    onSuccess: (p) => {
                        const list: Perm[] = p.permissionList ?? [];
                        const byResource: Record<string, Perm[]> = {};
                        for (const perm of list) {
                            byResource[perm.resource] ??= [];
                            byResource[perm.resource].push(perm);
                        }
                        this.groups = Object.keys(byResource)
                            .sort((a, b) => a.localeCompare(b))
                            .map((resource) => ({ resource, items: byResource[resource] }));
                        this.loadingPerms = false;
                    },
                    onFail: () => { this.loadingPerms = false; }
                }
            });
        },
        allCodes(): string[] {
            return this.groups.flatMap((g) => g.items.map((i) => i.permissionCode));
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
        selectAll() { this.selected = this.allCodes(); },
        clearAll() { this.selected = []; },
        /** Validate the picker + stash the ADMR draft; returns true when saved (screen navigates). */
        buildAndSaveDraft(): boolean {
            this.permError = this.selected.length === 0;
            if (this.permError) return false;
            ModuleFlowStore.saveDraft("ADMR", {
                form: this.form,
                selected: this.selected,
                // permissionName lookup for the confirm screen's readable list
                labels: this.groups.flatMap((g) => g.items)
                    .filter((p) => this.selected.includes(p.permissionCode))
                    .map((p) => ({ code: p.permissionCode, name: p.permissionName })),
                idempotencyKey: crypto.randomUUID()
            });
            return true;
        }
    }
});
