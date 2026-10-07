/** POS10000I03 — one sellable variant with this inventory's stock; price already falls back to the product's. */
export interface SellableVariant {
    variantId: string;
    variantCode?: string;
    variantName?: string;
    attributes?: string;
    barcode?: string | null;
    sellingPrice: number;
    stockQuantity?: number;
}
