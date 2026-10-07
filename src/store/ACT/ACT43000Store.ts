import { defineStore } from "pinia";
import RetrievePostingRules from "@/services/api/ACT/retrievePostingRules";
import SavePostingRules from "@/services/api/ACT/savePostingRules";
import { loadMappingRows, saveMappingRows } from "@/store/ACT/mappingStoreSupport";
import type { PostingRuleRow, PostingAccountOption } from "@/models/ACT/ACT43000";

/** ACT43000 posting-rules store: load slots + defaults/overrides, edit locally, save. */
export const ACT43000Store = defineStore("ACT43000Store", {
    state: () => ({
        loading: false,
        saving: false,
        rows: [] as PostingRuleRow[],
        accounts: [] as PostingAccountOption[],
        listApi: RetrievePostingRules.getInstance(),
        saveApi: SavePostingRules.getInstance()
    }),
    getters: {
        // Rows grouped by their `group` (SALES, CASH, ...) for the sectioned screen.
        groups(state): { name: string; rows: PostingRuleRow[] }[] {
            const order: string[] = [];
            const byGroup: Record<string, PostingRuleRow[]> = {};
            for (const r of state.rows) {
                const g = r.group ?? "OTHER";
                if (!byGroup[g]) { byGroup[g] = []; order.push(g); }
                byGroup[g].push(r);
            }
            return order.map((name) => ({ name, rows: byGroup[name] }));
        }
    },
    actions: {
        load() {
            loadMappingRows(this, this.listApi, (p) => p.ruleList, (p) => p.accountList);
        },
        save(failTitle: string, done?: () => void) {
            const payload = { rules: this.rows.map((r) => ({ ruleKey: r.ruleKey, accountCode: r.accountCode ?? "" })) };
            saveMappingRows(this, this.saveApi, payload, () => this.load(), failTitle, done);
        }
    }
});
