import { defineStore } from "pinia";
import ModuleApi from "@/services/api/COMMON/module-api";
import type { CustomFieldUsageRow, PRD13100Response } from "@/models/POS/PRD/PRD13000";

/** PRD13100 custom-field usage store: paged products that carry a value for one field. */
export const PRD13100Store = defineStore("PRD13100Store", {
    state: () => ({
        loading: false,
        fieldId: "",
        rows: [] as CustomFieldUsageRow[],
        total: 0,
        pageNo: 1,
        pageSize: 10
    }),
    actions: {
        load(fieldId: string, pageNo = 1) {
            this.fieldId = fieldId;
            this.pageNo = pageNo;
            this.loading = true;
            ModuleApi.request<PRD13100Response>("PRD13100I01", { fieldId, pageNo, pageSize: this.pageSize }, {
                onSuccess: (p) => { this.rows = p.productList ?? []; this.total = Number(p.totalCount ?? 0); this.loading = false; },
                onFail: () => { this.rows = []; this.total = 0; this.loading = false; }
            });
        }
    }
});
