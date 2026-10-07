import { defineStore } from "pinia";
import RetrieveExpenseList from "@/services/api/EXP/retrieveExpenseList";
import DeleteExpense from "@/services/api/EXP/deleteExpense";
import RetrieveExpenseCategoryLookup from "@/services/api/EXP/retrieveExpenseCategoryLookup";
import type { ExpenseRow, EXP10000Response } from "@/models/POS/EXP/EXP10000";
import type { ExpenseCategoryOption, EXP11000I02Response } from "@/models/POS/EXP/EXP30000";

/** EXP10000 expense-records list store: keyword/date-range/category filters, paging, delete. */
export const EXP10000Store = defineStore("EXP10000Store", {
    state: () => ({
        keyword: "",
        categoryId: undefined as string | undefined,
        dateRange: [] as string[],
        rows: [] as ExpenseRow[],
        categories: [] as ExpenseCategoryOption[],
        loading: false,
        total: 0,
        pageNo: 1,
        pageSize: 10,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        listApi: RetrieveExpenseList.getInstance(),
        deleteApi: DeleteExpense.getInstance(),
        categoryApi: RetrieveExpenseCategoryLookup.getInstance()
    }),
    getters: {
        /** Total of the amounts on the current page — a running feel for the filtered set. */
        pageTotal(): number {
            return this.rows.reduce((sum, r) => sum + Number(r.amount ?? 0), 0);
        }
    },
    actions: {
        reload() {
            this.loading = true;
            this.listApi.request({
                dataBody: {
                    searchKeyword: this.keyword || undefined,
                    categoryId: this.categoryId || undefined,
                    startDate: this.dateRange?.[0] || undefined,
                    endDate: this.dateRange?.[1] || undefined,
                    pageNo: this.pageNo,
                    pageSize: this.pageSize
                },
                listener: {
                    onSuccess: (p: EXP10000Response) => {
                        // Legacy v1 rows can carry a null currency — settle it here
                        // so every consumer downstream gets a real currency code.
                        this.rows = (p.expenseList ?? []).map((r) => ({ ...r, currency: r.currency || "USD" }));
                        this.total = p.totalCount ?? 0;
                        this.loading = false;
                    },
                    onFail: () => { this.rows = []; this.total = 0; this.loading = false; }
                }
            });
        },
        loadCategories() {
            this.categoryApi.request({
                dataBody: {} as Record<string, never>,
                listener: {
                    onSuccess: (p: EXP11000I02Response) => { this.categories = p.categoryList ?? []; },
                    onFail: () => { this.categories = []; }
                }
            });
        },
        onSearch() {
            if (this.searchTimer) clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(() => { this.pageNo = 1; this.reload(); }, 300);
        },
        onFilter() {
            this.pageNo = 1;
            this.reload();
        },
        setPage(pageNo: number, pageSize: number) {
            this.pageNo = pageNo;
            this.pageSize = pageSize;
            this.reload();
        },
        remove(expenseId: string, done: (ok: boolean, error?: Record<string, unknown>) => void) {
            this.deleteApi.request({
                dataBody: { expenseId },
                listener: {
                    onSuccess: () => { this.reload(); done(true); },
                    onFail: (e: Record<string, unknown>) => done(false, e)
                }
            });
        }
    }
});
