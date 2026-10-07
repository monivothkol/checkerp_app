/** Expense choice/list row (sub-type under a category) — EXP20000. */
export interface ExpenseListRow {
    listId: string;
    code: string;
    name: string;
    categoryId: string;
    categoryName?: string;
    isActive: boolean;
}

export interface EXP20000Response {
    totalCount: number;
    expenseListList: ExpenseListRow[];
}

/** Lists-by-category lookup — EXP11000I03 (id + name only). */
export interface ExpenseListOption {
    listId: string;
    name: string;
}

export interface EXP11000I03Request {
    categoryId?: string;
}

export interface EXP11000I03Response {
    expenseListList: ExpenseListOption[];
}
