import { defineStore } from "pinia";
import ModuleApi, { type ModuleApiError } from "@/services/api/COMMON/module-api";
import type { PRD13000Response, ProductCustomField } from "@/models/POS/PRD/PRD13000";

type Done = (ok: boolean, error?: ModuleApiError) => void;

/** PRD13000 custom-field modal store: list, create and delete the company's product custom fields. */
export const PRD13000Store = defineStore("PRD13000Store", {
    state: () => ({
        loading: false,
        saving: false,
        newLabel: "",
        fields: [] as ProductCustomField[]
    }),
    actions: {
        load() {
            this.loading = true;
            ModuleApi.request<PRD13000Response>("PRD13000I01", {}, {
                onSuccess: (p) => { this.fields = p.fieldList ?? []; this.loading = false; },
                onFail: () => { this.fields = []; this.loading = false; }
            });
        },
        create(done: Done) {
            this.run("PRD13000I02", { label: this.newLabel.trim() }, (ok, error) => {
                if (ok) this.newLabel = "";
                done(ok, error);
            });
        },
        remove(fieldId: string, done: Done) {
            this.run("PRD13000I03", { fieldId }, done);
        },
        /** Shared write runner: reloads the list on success. */
        run(trCode: string, body: Record<string, unknown>, done: Done) {
            this.saving = true;
            ModuleApi.request(trCode, body, {
                onSuccess: () => { this.saving = false; this.load(); done(true); },
                onFail: (e) => { this.saving = false; done(false, e); }
            });
        }
    }
});
