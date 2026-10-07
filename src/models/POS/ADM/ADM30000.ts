/** Store / company info — ADM30000 (detail) + ADM31000 (edit load/save). */

export interface StoreInfo {
    companyCode?: string;
    companyName?: string;
    legalName?: string;
    taxId?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    subdomain?: string;
    currency?: string;
    timezone?: string;
    invoiceTerms?: string;
    logoUrl?: string;
}

/** Editable fields sent by ADM31000 save. */
export interface ADM31000Request {
    companyName: string;
    legalName: string;
    taxId: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    timezone: string;
    invoiceTerms: string;
}
