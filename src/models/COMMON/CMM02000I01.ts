/** CMM02000I01 - common tenant reference data (cached in IndexedDB). */

export interface RefPaymentMethod {
    paymentMethodId: string;
    methodCode?: string;
    methodName?: string;
    methodType?: string;
    requiresChange?: boolean;
}

export interface RefBank {
    bankCode?: string;
    bankName?: string;
    shortName?: string;
}

export interface RefCurrency {
    primaryCurrency?: string;
    secondaryCurrency?: string;
    exchangeRate?: number;
}

export interface RefTaxRate {
    taxId: string;
    taxCode?: string;
    taxName?: string;
    rate?: number;
    appliesTo?: "SALES" | "PURCHASE" | "BOTH";
    isDefault?: boolean;
}
export interface RefTaxDefaults {
    defaultSalesTaxId?: string | null;
    defaultPurchaseTaxId?: string | null;
    pricesIncludeTax?: boolean;
    /** Sales Setting "customer pays VAT": false = never add tax at checkout. */
    customerPayVat?: boolean;
}
export type CMM02000I01Request = Record<string, never>;

export interface CMM02000I01Response {
    paymentMethods?: RefPaymentMethod[];
    banks?: RefBank[];
    currency?: RefCurrency;
    allowSellWithoutStock?: boolean;
    enableProductPromotion?: boolean;
    taxRates?: RefTaxRate[];
    tax?: RefTaxDefaults;
}
