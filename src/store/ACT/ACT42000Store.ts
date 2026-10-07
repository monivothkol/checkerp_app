import { defineStore } from "pinia";
import RetrieveExpenseRoutes from "@/services/api/ACT/retrieveExpenseRoutes";
import SaveExpenseRoutes from "@/services/api/ACT/saveExpenseRoutes";
import { loadMappingRows, saveMappingRows } from "@/store/ACT/mappingStoreSupport";
import type { ExpenseRouteRow, ExpenseAccountOption } from "@/models/ACT/ACT42000";

/** ACT42000 expense-route store: load categories + their account, edit locally, save. */
export const ACT42000Store = defineStore("ACT42000Store", {
    state: () => ({
        loading: false,
        saving: false,
        rows: [] as ExpenseRouteRow[],
        accounts: [] as ExpenseAccountOption[],
        listApi: RetrieveExpenseRoutes.getInstance(),
        saveApi: SaveExpenseRoutes.getInstance()
    }),
    actions: {
        load() {
            loadMappingRows(this, this.listApi, (p) => p.routeList, (p) => p.accountList);
        },
        save(failTitle: string, done?: () => void) {
            const payload = { routes: this.rows.map((r) => ({ categoryId: r.categoryId, accountCode: r.accountCode ?? "" })) };
            saveMappingRows(this, this.saveApi, payload, () => this.load(), failTitle, done);
        }
    }
});
