/** ACT41000 payment method → GL account mapping. */

export interface PaymentMappingRow {
    paymentMethodId: string;
    methodCode?: string;
    methodName?: string;
    methodType?: string;
    accountCode?: string | null;
    accountName?: string | null;
}

export interface CashAccountOption {
    accountCode: string;
    accountName: string;
}

export interface PaymentMappingResponse {
    mappingList: PaymentMappingRow[];
    accountList: CashAccountOption[];
}

export interface SavePaymentMappingRequest {
    mappings: { paymentMethodId: string; accountCode: string }[];
}

export interface SavePaymentMappingResponse {
    saved: number;
    cleared: number;
}
