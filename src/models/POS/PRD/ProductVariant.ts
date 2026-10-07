/** Product variants tab (PRD50000I05–I09). Prices left empty use the product's price. */

export interface VariantAttribute {
    attributeId?: string;
    attributeName: string;
    options: string[];
}

/** A price cell: number from the server, text while typing, null when the product price applies. */
export type VariantPrice = number | string | null;

export interface ProductVariant {
    variantId: string;
    /** Table row key while the variant is only a draft (no id until the product is saved). */
    rowKey?: string;
    /** The variant's own identifiers — typed, like a product's. Blank code falls back to VAR-nnn. */
    variantCode?: string;
    variantCodeSecondary?: string;
    variantName?: string;
    attributes: Record<string, string>;
    barcode?: string | null;
    costPrice?: VariantPrice;
    sellingPrice?: VariantPrice;
    wholesalePrice?: VariantPrice;
    isActive: boolean;
    stockQuantity?: number;
}

/** Stock a product still holds on its variant-less row, per inventory. */
export interface UnallocatedStock {
    inventoryId: string;
    inventoryName: string;
    quantity: number;
    averageCost?: number;
}

/** One inventory's split of that stock across the product's variants. */
export interface StockAllocation {
    inventoryId: string;
    /** `variantIndex` places stock on a variant created by the same submit (no id yet). */
    lines: { variantId: string; variantIndex: number; quantity: number }[];
}

export interface VariantListResponse {
    attributeList: VariantAttribute[];
    variantList: ProductVariant[];
    unallocatedStock?: UnallocatedStock[];
}

/** What the product create/edit payload carries for the whole variant set. */
export interface VariantDraft {
    attributeList: VariantAttribute[];
    variantList: ProductVariant[];
    stockAllocation?: StockAllocation[];
}

export interface VariantRemoveResponse {
    variantId: string;
    result: "DELETED" | "DEACTIVATED";
}
