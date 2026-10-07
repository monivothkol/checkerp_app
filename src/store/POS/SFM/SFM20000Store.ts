import { defineStore } from "pinia";
import RetrieveStaffFinancialDetail from "@/services/api/SFM/retrieveStaffFinancialDetail";
import RetrieveStaffFinancialTransactions from "@/services/api/SFM/retrieveStaffFinancialTransactions";
import type { StaffFinancialDetail, StaffFinancialTransaction } from "@/models/POS/SFM/SFM20000";

/**
 * SFM20000 staff-financial detail store: one account's balances plus its paged
 * transaction history (SFM20000I01, optional accountType filter).
 */
export const SFM20000Store = defineStore("SFM20000Store", {
    state: () => ({
        loading: true,
        staffId: "",
        detail: null as StaffFinancialDetail | null,
        // transaction history
        txRows: [] as StaffFinancialTransaction[],
        txLoading: false,
        txTotal: 0,
        pageNo: 1,
        pageSize: 10,
        accountType: undefined as string | undefined,
        detailApi: RetrieveStaffFinancialDetail.getInstance(),
        txApi: RetrieveStaffFinancialTransactions.getInstance()
    }),
    actions: {
        load(staffId: string) {
            this.staffId = staffId;
            if (!staffId) { this.loading = false; return; }
            this.loading = true;
            this.detailApi.request({
                dataBody: { staffId },
                listener: {
                    onSuccess: (p) => { this.detail = p; this.loading = false; },
                    onFail: () => { this.detail = null; this.loading = false; }
                }
            });
            this.pageNo = 1;
            this.loadTransactions();
        },
        loadTransactions() {
            if (!this.staffId) return;
            this.txLoading = true;
            this.txApi.request({
                dataBody: { staffId: this.staffId, accountType: this.accountType || undefined, pageNo: this.pageNo, pageSize: this.pageSize },
                listener: {
                    onSuccess: (p) => {
                        this.txRows = p.transactionList ?? [];
                        this.txTotal = p.totalCount ?? 0;
                        this.txLoading = false;
                    },
                    onFail: () => { this.txRows = []; this.txTotal = 0; this.txLoading = false; }
                }
            });
        },
        setTxPage(pageNo: number, pageSize: number) {
            this.pageNo = pageNo;
            this.pageSize = pageSize;
            this.loadTransactions();
        }
    }
});
