import { defineStore } from "pinia";
import dayjs from "dayjs";
import RetrieveAccountList from "@/services/api/ACT/retrieveAccountList";
import RetrieveAccountLedger from "@/services/api/ACT/retrieveAccountLedger";
import type { ActAccount, ActLedgerSection } from "@/models/ACT/ACT40000";

/** ACT33000 general ledger (QuickBooks-style): all accounts for a date range, optional account filter. */
export const ACT33000Store = defineStore("ACT33000Store", {
    state: () => ({
        loading: false,
        accounts: [] as ActAccount[],
        accountCodes: [] as string[],
        dateRange: [dayjs().startOf("month").format("YYYY-MM-DD"), dayjs().format("YYYY-MM-DD")] as [string, string] | null,
        sections: [] as ActLedgerSection[],
        totalDebit: 0,
        totalCredit: 0,
        expanded: {} as Record<string, boolean>,
        accountApi: RetrieveAccountList.getInstance(),
        ledgerApi: RetrieveAccountLedger.getInstance()
    }),
    getters: {
        accountOptions(state) {
            return state.accounts
                .filter((a) => !a.isHeader)
                .map((a) => ({ value: a.accountCode, label: `${a.accountCode} · ${a.accountName}` }));
        },
        allExpanded(state): boolean {
            return state.sections.length > 0 && state.sections.every((s) => state.expanded[s.accountCode]);
        }
    },
    actions: {
        loadAccounts() {
            this.accountApi.request({
                dataBody: {},
                listener: {
                    onSuccess: (p) => { this.accounts = p.accountList ?? []; },
                    onFail: () => { this.accounts = []; }
                }
            });
        },
        load() {
            // The report is range-bound (year-to-date can be 50k+ lines), so no range = no request.
            if (!this.dateRange) return;
            this.loading = true;
            this.ledgerApi.request({
                dataBody: { fromDate: this.dateRange[0], toDate: this.dateRange[1], accountCodes: this.accountCodes },
                listener: {
                    onSuccess: (p) => {
                        this.sections = (p.accountList ?? []) as ActLedgerSection[];
                        this.totalDebit = Number(p.totalDebit ?? 0);
                        this.totalCredit = Number(p.totalCredit ?? 0);
                        this.expanded = {};
                        this.loading = false;
                    },
                    onFail: () => {
                        this.sections = [];
                        this.totalDebit = 0;
                        this.totalCredit = 0;
                        this.loading = false;
                    }
                }
            });
        },
        toggle(accountCode: string) {
            this.expanded[accountCode] = !this.expanded[accountCode];
        },
        toggleAll() {
            const open = !this.allExpanded;
            this.expanded = Object.fromEntries(this.sections.map((s) => [s.accountCode, open]));
        }
    }
});
