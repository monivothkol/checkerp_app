/** Bakong merchant config — ADM60000 (detail) + ADM61000 (edit load/save). */

export interface BakongInfo {
    exists?: boolean;
    bakongAccountId?: string;
    merchantType?: string;
    merchantName?: string;
    merchantCity?: string;
    merchantId?: string;
    acquiringBank?: string;
    defaultCurrency?: string;
    merchantCategoryCode?: string;
    storeLabel?: string;
    terminalLabel?: string;
    mobileNumber?: string;
}
