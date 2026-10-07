/** Staff financial account row — SFM10000. */
export interface StaffFinancialRow {
    staffId: string;
    staffCode: string;
    staffName: string;
    loanBalance: number | string;
    advanceBalance: number | string;
    depositBalance: number | string;
}

export interface SFM10000Response {
    totalCount: number;
    accountList: StaffFinancialRow[];
}
