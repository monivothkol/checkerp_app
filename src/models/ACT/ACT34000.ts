/** ACT34000 cash flow (direct method): counterpart cash movements by activity. */

export interface CashFlowRow {
    accountCode: string;
    accountName: string;
    accountType: string;
    cashImpact: number; // + = cash in, - = cash out
}

export interface CashFlowResponse {
    openingCash: number;
    closingCash: number;
    netChange: number;
    operatingList: CashFlowRow[];
    investingList: CashFlowRow[];
    financingList: CashFlowRow[];
    operatingTotal: number;
    investingTotal: number;
    financingTotal: number;
}
