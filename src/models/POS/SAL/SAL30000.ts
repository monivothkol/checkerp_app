/** Packaging (SAL30000-36000) models. */

export interface PackagingRow {
    packagingId: string;
    packagingCode: string;
    sourceType: string;
    saleId?: string;
    saleCode?: string;
    referenceNumber?: string;
    status: string;
    packerName?: string;
    createdAt?: string;
    itemCount: number;
    packedCount: number;
}
export interface SAL30000Request { status?: string; searchKeyword?: string; pageNo?: number; pageSize?: number; }
export interface SAL30000Response { totalCount: number; packagingList: PackagingRow[]; }

/** A draft item pulled from a sale (SAL31000) — required prefilled, packed starts 0. */
export interface PackagingDraftItem {
    saleItemId?: string;
    productId?: string;
    variantId?: string;
    productCode?: string;
    productName?: string;
    unitName?: string;
    quantityRequired: number;
    sortOrder?: number;
    barcode?: string;
    imageUrl?: string;
}
export interface SAL31000Request { saleId: string; }
export interface SAL31000Response { itemList: PackagingDraftItem[]; }

/** Create payload (SAL32000). */
export interface PackagingCreateItem {
    saleItemId?: string;
    productId?: string;
    productCode?: string;
    productName?: string;
    barcode?: string;
    unitName?: string;
    quantityRequired: number;
    sortOrder?: number;
}
export interface SAL32000Request {
    sourceType?: string;
    saleId?: string;
    referenceNumber?: string;
    notes?: string;
    packerId?: string;
    items: PackagingCreateItem[];
}
export interface SAL32000Response { packagingId: string; packagingCode: string; }

/** Detail (SAL34000) + pack (SAL35000) share this shape. */
export interface PackagingHeader {
    packagingId: string;
    packagingCode: string;
    sourceType: string;
    saleId?: string;
    saleCode?: string;
    referenceNumber?: string;
    status: string;
    notes?: string;
    packagedBy?: string;
    packagedByCode?: string;
    packagedAt?: string;
    packerId?: string;
    packerName?: string;
    createdAt?: string;
    store?: import("@/models/POS/invoice").InvoiceStore;
}
export interface PackagingItem {
    itemId: string;
    saleItemId?: string;
    productId?: string;
    productCode?: string;
    productName?: string;
    barcode?: string;
    unitName?: string;
    quantityRequired: number;
    quantityPackaged: number;
    sortOrder?: number;
    imageUrl?: string;
}
export interface SAL34000Request { packagingId: string; }
export interface SAL34000Response { packaging: PackagingHeader; items: PackagingItem[]; }

/** Pack one item (SAL35000): set packed and/or required qty. */
export interface SAL35000Request {
    packagingId: string;
    itemId: string;
    quantityPackaged?: number;
    quantityRequired?: number;
}
export type SAL35000Response = SAL34000Response;

export interface SAL36000Request { packagingId: string; }
export interface SAL36000Response { status: string; }

/** Edit payload (SAL37000) — replaces a PENDING packaging's header + items. */
export interface SAL37000UpdatePayload {
    packagingId: string;
    packerId?: string;
    referenceNumber?: string;
    notes?: string;
    items: PackagingCreateItem[];
}

export interface SAL37000UpdateResponse {
    packagingId?: string;
}
