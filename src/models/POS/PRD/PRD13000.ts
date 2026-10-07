/** Product custom fields — PRD13000I01 list / I02 create / I03 delete, PRD13100I01 usage. */

export interface ProductCustomField {
    fieldId: string;
    label: string;
    displayOrder?: number;
    /** How many products carry a value; only 0 may be deleted. */
    usageCount: number;
}

export interface PRD13000Response {
    fieldList: ProductCustomField[];
}

export interface CustomFieldUsageRow {
    productId: string;
    productCode: string;
    productName: string;
    isActive?: boolean;
    value: string;
}

export interface PRD13100Response {
    label?: string;
    totalCount: number;
    productList: CustomFieldUsageRow[];
}

/** One filled-in value on a product (PRD50000I01 `customFields`, PRD50000I02 body). */
export interface ProductCustomFieldValue {
    fieldId: string;
    label?: string;
    value: string;
}
