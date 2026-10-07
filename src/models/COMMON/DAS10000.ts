/** Store dashboard (DAS10000). */

export interface DashboardData {
    todayRevenue: number;
    thisWeekRevenue: number;
    thisMonthRevenue: number;
    todayActualPayment: number;
    dailySaleProfit: Array<Record<string, unknown>>;
    topProducts: Array<Record<string, unknown>>;
    topProfitItems: Array<Record<string, unknown>>;
    weeklyTrend: Array<Record<string, unknown>>;
    productIdentifier: string; // PRODUCT_CODE | BARCODE
}
