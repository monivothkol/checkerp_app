import { defineStore } from "pinia";
import CreateExpense from "@/services/api/EXP/createExpense";
import UpdateExpense from "@/services/api/EXP/updateExpense";
import RetrieveExpenseDetail from "@/services/api/EXP/retrieveExpenseDetail";
import RetrieveExpenseCategoryLookup from "@/services/api/EXP/retrieveExpenseCategoryLookup";
import RetrieveExpenseListLookup from "@/services/api/EXP/retrieveExpenseListLookup";
import type { ExpenseDetail, ExpenseSaveRequest, ExpenseSaveResponse } from "@/models/POS/EXP/EXP10000";
import type { ExpenseCategoryOption, EXP11000I02Response } from "@/models/POS/EXP/EXP30000";
import type { ExpenseListOption, EXP11000I03Response } from "@/models/POS/EXP/EXP20000";

type SaveDone = (ok: boolean, res?: ExpenseSaveResponse, error?: Record<string, unknown>) => void;

/**
 * EXP11000 expense create/edit form store, shared across the create flow
 * (EXP11000 → EXP12000 confirm → EXP13000 result). The expense-choice dropdown
 * is a dependent select — it reloads from EXP11000I03 whenever the category
 * changes, and the previously picked choice is cleared if it no longer belongs.
 */
export const EXP11000Store = defineStore("EXP11000Store", {
    state: () => ({
        expenseId: undefined as string | undefined,
        expenseType: "DAILY",
        categoryId: undefined as string | undefined,
        listId: undefined as string | undefined,
        description: "",
        amount: undefined as number | undefined,
        currency: "USD",
        expenseDate: "",
        notes: "",
        categories: [] as ExpenseCategoryOption[],
        lists: [] as ExpenseListOption[],
        loading: false,
        submitting: false,
        // Set by the confirm step; the result screen (EXP13000) renders it.
        saved: null as ExpenseSaveResponse | null,
        createApi: CreateExpense.getInstance(),
        updateApi: UpdateExpense.getInstance(),
        detailApi: RetrieveExpenseDetail.getInstance(),
        categoryApi: RetrieveExpenseCategoryLookup.getInstance(),
        listApi: RetrieveExpenseListLookup.getInstance()
    }),
    getters: {
        isEdit(): boolean {
            return Boolean(this.expenseId);
        },
        /** True once the form holds enough to save — drives the confirm step. */
        isComplete(): boolean {
            return Boolean(this.categoryId && this.listId && Number(this.amount) > 0 && this.expenseDate);
        },
        categoryName(): string {
            return this.categories.find((c) => c.categoryId === this.categoryId)?.name ?? "";
        },
        listName(): string {
            return this.lists.find((l) => l.listId === this.listId)?.name ?? "";
        }
    },
    actions: {
        /** Blank form for a create; `expenseId` switches it to edit and pulls the detail. */
        reset(expenseId?: string, today = "") {
            this.expenseId = expenseId;
            this.expenseType = "DAILY";
            this.categoryId = undefined;
            this.listId = undefined;
            this.description = "";
            this.amount = undefined;
            this.currency = "USD";
            this.expenseDate = today;
            this.notes = "";
            this.lists = [];
            this.submitting = false;
            this.saved = null;
            this.loadCategories();
            if (expenseId) {
                this.loadDetail(expenseId);
            }
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
        loadDetail(expenseId: string) {
            this.loading = true;
            this.detailApi.request({
                dataBody: { expenseId },
                listener: {
                    onSuccess: (d: ExpenseDetail) => {
                        this.expenseType = d.expenseType ?? "DAILY";
                        this.categoryId = d.categoryId ?? undefined;
                        this.listId = d.listId ?? undefined;
                        this.description = d.description ?? "";
                        this.amount = d.amount == null ? undefined : Number(d.amount);
                        this.currency = d.currency ?? "USD";
                        this.expenseDate = d.expenseDate ?? "";
                        this.notes = d.notes ?? "";
                        this.loading = false;
                        // Load the sibling lists so the saved one shows a label, not an id.
                        this.loadLists(false);
                    },
                    onFail: () => { this.loading = false; }
                }
            });
        },
        /** Reload the dependent list dropdown; `clearSelection` on a user-driven category change. */
        loadLists(clearSelection = true) {
            if (clearSelection) {
                this.listId = undefined;
            }
            if (!this.categoryId) {
                this.lists = [];
                return;
            }
            this.listApi.request({
                dataBody: { categoryId: this.categoryId },
                listener: {
                    onSuccess: (p: EXP11000I03Response) => {
                        this.lists = p.expenseListList ?? [];
                        // A stale selection that isn't under this category can't be saved.
                        if (this.listId && !this.lists.some((l) => l.listId === this.listId)) {
                            this.listId = undefined;
                        }
                    },
                    onFail: () => { this.lists = []; }
                }
            });
        },
        submit(done: SaveDone) {
            this.submitting = true;
            const body: ExpenseSaveRequest = {
                expenseType: this.expenseType,
                categoryId: this.categoryId,
                listId: this.listId,
                description: this.description || undefined,
                amount: this.amount as number,
                currency: this.currency,
                expenseDate: this.expenseDate,
                notes: this.notes || undefined
            };
            if (this.expenseId) {
                body.expenseId = this.expenseId;
            }
            const api = this.expenseId ? this.updateApi : this.createApi;
            api.request({
                dataBody: body,
                listener: {
                    onSuccess: (r: ExpenseSaveResponse) => { this.submitting = false; this.saved = r; done(true, r); },
                    onFail: (e: Record<string, unknown>) => { this.submitting = false; done(false, undefined, e); }
                }
            });
        }
    }
});
