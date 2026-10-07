/** Price-group list — CUS40000 (customer-group price overrides). */

/** Customer-group dropdown row (loaded from CUS20000). */
export interface CustomerGroupLookup {
    groupId: string;
    groupCode?: string;
    groupName: string;
}

export interface PriceGroupRow {
    priceId: string;
    groupCode?: string;
    groupName: string;
    productCode?: string;
    productName: string;
    originalPrice?: number;
    groupPrice?: number;
}

export interface CUS40000Request {
    groupId?: string;
    searchKeyword?: string;
    pageNo?: number;
    pageSize?: number;
}

export interface CUS40000Response {
    totalCount: number;
    priceList: PriceGroupRow[];
}

export interface CustomerGroupListResponse {
    groupList: CustomerGroupLookup[];
}
