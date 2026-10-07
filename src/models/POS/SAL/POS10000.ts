/** POS10000 product grid — products + per-inventory stock + best unit promo price. */

export interface PosProductRow {
    productId: string;
    sku: string;
    productName: string;
    barcode?: string;
    imageUrl?: string;
    unitOfMeasure?: string;
    sellingPrice: number;
    promotionPrice?: number;
    isTrackInventory: boolean;
    stockQuantity: number;
    categoryId?: string;
    brandId?: string;
    /** Product-level tax override (null = store default sales tax). */
    taxId?: string | null;
    taxRate?: number | null;
    /** The product sells as one of its variants — the POS asks which one. */
    hasVariants?: boolean;
    /** Set when the search term was a variant's own barcode/code — sell that one directly. */
    scannedVariantId?: string;
}

export interface POS10000Request {
    inventoryId?: string;
    searchKeyword?: string;
    pageNo?: number;
    pageSize?: number;
}

export interface POS10000Response {
    totalCount: number;
    productList: PosProductRow[];
}

/** A single product inside a bundle promotion, at its bundle price. */
export interface PosBundleItem {
    productId: string;
    /** Set when the bundle sells one specific variant of the product. */
    variantId?: string;
    variantName?: string;
    productName?: string;
    productCode?: string;
    imageUrl?: string;
    unitOfMeasure?: string;
    quantity: number;
    bundlePrice: number;
}

/** An active bundle promotion for the POS bundle picker (POS16000). */
export interface PosBundle {
    promotionId: string;
    promotionName: string;
    bundleTotal: number;
    items: PosBundleItem[];
}

export interface POS16000Response {
    bundles: PosBundle[];
}
