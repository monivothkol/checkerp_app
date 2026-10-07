import type { SAL12000CreatePayload } from "@/models/POS/SAL/SAL12000";

/** SAL17000 — edit an existing quotation. Same shape as create + the target code.
 *  Lines are replaced wholesale (backend SAL17000I01_QuotationUpdate). */
export interface SAL17000UpdatePayload extends SAL12000CreatePayload {
    quotationNo: string;
}

export interface SAL17000UpdateResponse {
    quotationNo: string;
}
