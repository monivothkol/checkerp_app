/** Book-format statement export shared by ACT30100 / 31100 / 32100 / 34100 (and ACT35100). */
export interface StatementExportRequest {
    fromDate?: string;
    toDate?: string;
    asOfDate?: string;
    format: "pdf" | "excel";
}

export interface StatementExportResponse {
    url: string;
    fileName: string;
    balanced?: boolean;
}
