/** Expense record row — EXP10000 list. */
export interface ExpenseRow {
    expenseId: string;
    code: string;
    expenseType: string;
    categoryId: string;
    categoryName?: string;
    listId: string;
    listName?: string;
    description?: string;
    amount: number | string;
    currency: string;
    expenseDate: string;
}

export interface EXP10000Request {
    pageNo?: number;
    pageSize?: number;
    searchKeyword?: string;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
}

export interface EXP10000Response {
    totalCount: number;
    expenseList: ExpenseRow[];
}

/** Expense detail — EXP15000 (adds the fields the list omits). */
export interface ExpenseDetail extends ExpenseRow {
    supplierId?: string;
    paymentMethodId?: string;
    notes?: string;
}

export interface EXP15000Request {
    expenseId: string;
}

/** Create/update body — EXP11000 / EXP16000. `expenseId` is set only on update. */
export interface ExpenseSaveRequest {
    expenseId?: string;
    expenseType?: string;
    categoryId?: string;
    listId?: string;
    description?: string;
    amount: number | string;
    currency?: string;
    expenseDate: string;
    paymentMethodId?: string;
    supplierId?: string;
    notes?: string;
}

export interface ExpenseSaveResponse {
    expenseId: string;
    code?: string;
}

export interface EXP17000Request {
    expenseId: string;
}
