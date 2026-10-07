/** ACT42000 expense category → GL account routing. */

export interface ExpenseRouteRow {
    categoryId: string;
    categoryCode?: string;
    categoryName?: string;
    accountCode?: string | null;
    accountName?: string | null;
}

export interface ExpenseAccountOption {
    accountCode: string;
    accountName: string;
}

export interface ExpenseRouteResponse {
    routeList: ExpenseRouteRow[];
    accountList: ExpenseAccountOption[];
}

export interface SaveExpenseRouteRequest {
    routes: { categoryId: string; accountCode: string }[];
}

export interface SaveExpenseRouteResponse {
    saved: number;
    cleared: number;
}
