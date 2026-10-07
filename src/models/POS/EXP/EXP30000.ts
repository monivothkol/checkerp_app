/** Expense category row — EXP30000 list (the shape the generic module screens bind to). */
export interface ExpenseCategoryRow {
    categoryId: string;
    code: string;
    name: string;
    isActive: boolean;
    defaultAccountCode?: string;
    listCount?: number;
}

export interface EXP30000Response {
    totalCount: number;
    categoryList: ExpenseCategoryRow[];
}

/** Active-category lookup — EXP11000I02 (id + name only). */
export interface ExpenseCategoryOption {
    categoryId: string;
    name: string;
}

export interface EXP11000I02Response {
    categoryList: ExpenseCategoryOption[];
}
