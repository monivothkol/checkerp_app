/** ACT36000 VAT return: Output VAT collected minus Input VAT paid, by source type. */

export interface VatReturnRow {
    sourceType: string;
    amount: number;     // collected (output) / paid (input)
    adjustment: number; // returns that reverse it
    net: number;
}

export interface VatReturnRequest {
    fromDate?: string;
    toDate?: string;
}

export interface VatReturnResponse {
    outputVatCode?: string;
    inputVatCode?: string;
    outputList?: VatReturnRow[];
    inputList?: VatReturnRow[];
    outputVat?: number;
    inputVat?: number;
    netPayable?: number; // negative = refundable
}
