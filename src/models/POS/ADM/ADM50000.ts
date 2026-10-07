/** Sale settings — ADM50000 (load) + ADM51000 (save). */

export interface SaleSettings {
    allowDelayedPayment?: boolean;
    enableProductPromotion?: boolean;
    allowCustomPrice?: boolean;
    allowSellWithoutStock?: boolean;
    allowDifferentSaleDate?: boolean;
    customerPayVat?: boolean;
    allowDuplicateLineItems?: boolean;
    primaryCurrency?: string;
    secondaryCurrency?: string;
    exchangeRate?: number;
    useProductSecondaryCodeInInvoice?: boolean;
    primaryProductIdentifier?: string;
    invoiceInfoSource?: string;
    showSalePersonNicknameOnInvoice?: boolean;
    enableCreditControl?: boolean;
    creditGateLimit?: boolean;
    creditGateOverdueAmount?: boolean;
    creditGateOverdueDays?: boolean;
    defaultSalesTaxId?: string | null;
    defaultPurchaseTaxId?: string | null;
    pricesIncludeTax?: boolean;
}

export interface TaxOption {
    taxId: string;
    taxCode?: string;
    taxName?: string;
    rate?: number;
    appliesTo?: string;
}
