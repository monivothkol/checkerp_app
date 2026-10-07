export interface PRD10000Request {
    searchKeyword?: string;
    categoryId?: string;
    brandId?: string;
    isActive?: boolean;
    pageNo?: number;
    pageSize?: number;
}

export interface ProductListItem {
    productId: string;
    productCode: string;
    productName: string;
    barcode?: string;
    sellingPrice?: number;
    costPrice?: number;
    unitOfMeasure?: string;
    categoryName?: string;
    imageUrl?: string;
    isActive?: boolean;
    /** The product sells as one of its variants — sale screens ask which one. */
    hasVariants?: boolean;
    taxId?: string | null;
    /** Rate (%) of the product's own tax, when it has one. */
    taxRatePct?: number | null;
}

export interface PRD10000Response {
    totalCount: number;
    productList: ProductListItem[];
}
