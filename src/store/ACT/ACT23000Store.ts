import { defineStore } from "pinia";
import POP from "@/core/utilities/pop";
import RetrieveReconciliation from "@/services/api/ACT/retrieveReconciliation";
import SetReconciled from "@/services/api/ACT/setReconciled";
import type { ReconcileLine, ReconcileAccountOption } from "@/models/ACT/ACT23000";

/** ACT23000 bank-reconciliation store: account/date filter, lines + marks + summary. */
export const ACT23000Store = defineStore("ACT23000Store", {
    state: () => ({
        loading: false,
        accountCode: undefined as string | undefined,
        dateRange: undefined as [string, string] | undefined,
        rows: [] as ReconcileLine[],
        accounts: [] as ReconcileAccountOption[],
        bookBalance: 0,
        clearedBalance: 0,
        unclearedBalance: 0,
        reconciledCount: 0,
        totalCount: 0,
        listApi: RetrieveReconciliation.getInstance(),
        markApi: SetReconciled.getInstance()
    }),
    actions: {
        load() {
            this.loading = true;
            this.listApi.request({
                dataBody: {
                    accountCode: this.accountCode,
                    fromDate: this.dateRange?.[0] ?? "",
                    toDate: this.dateRange?.[1] ?? ""
                },
                listener: {
                    onSuccess: (p) => {
                        this.accounts = p.accountList ?? [];
                        this.rows = p.lineList ?? [];
                        this.bookBalance = Number(p.bookBalance ?? 0);
                        this.clearedBalance = Number(p.clearedBalance ?? 0);
                        this.unclearedBalance = Number(p.unclearedBalance ?? 0);
                        this.reconciledCount = Number(p.reconciledCount ?? 0);
                        this.totalCount = Number(p.totalCount ?? 0);
                        this.loading = false;
                    },
                    onFail: () => { this.rows = []; this.loading = false; }
                }
            });
        },
        onFilter() {
            this.load();
        },
        /** Toggle a line's cleared mark, then refresh so the summary re-totals. */
        toggle(line: ReconcileLine, failTitle: string) {
            const next = !line.reconciled;
            this.markApi.request({
                dataBody: { lineId: line.lineId, reconciled: next, statementReference: line.statementReference ?? undefined },
                listener: {
                    onSuccess: () => this.load(),
                    onFail: (e: { message?: string; code?: string }) => {
                        POP.alert({ title: failTitle, status: "error", content: e?.message, errorCode: e?.code });
                    }
                }
            });
        }
    }
});
