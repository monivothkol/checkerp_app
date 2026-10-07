/**
 * Shared lookup-row shapes for cross-module pickers (customer/product/staff/
 * inventory/payment-method dropdowns loaded from other modules' list trCodes).
 * Kept minimal — only the fields the pickers read.
 */

export interface CustomerLookup {
    customerId: string;
    customerCode?: string;
    customerName: string;
    customerGroupId?: string;
    phone?: string;
    customerAddress?: string;
    customerType?: string;
}

export interface InventoryLookup {
    inventoryId: string;
    inventoryName?: string;
    name?: string;
    isDefault?: boolean;
}

/** Sale person / commission recipient dropdown row. */
export interface SalePersonLookup {
    salePersonId: string;
    name: string;
}

export interface StaffLookup {
    staffId: string;
    staffCode?: string;
    staffName?: string;
    firstName?: string;
    lastName?: string;
    nickname?: string;
}

export interface PaymentMethodLookup {
    paymentMethodId: string;
    methodCode?: string;
    methodName?: string;
}

export interface CategoryLookup {
    categoryId: string;
    categoryName: string;
}

export interface BrandLookup {
    brandId: string;
    brandName: string;
}

export interface SupplierLookup {
    supplierId: string;
    supplierCode?: string;
    contactName?: string;
    supplierName?: string;
}

/** Shared request for the paged lookup/list trCodes the pickers call. */
export interface LookupRequest {
    searchKeyword?: string;
    pageNo?: number;
    pageSize?: number;
    isActive?: boolean;
}

export interface CustomerLookupResponse { totalCount: number; customerList: CustomerLookup[]; }
export interface InventoryLookupResponse { totalCount: number; inventoryList: InventoryLookup[]; }
export interface StaffLookupResponse { totalCount: number; staffList: StaffLookup[]; }
export interface CategoryLookupResponse { totalCount: number; categoryList: CategoryLookup[]; }
export interface BrandLookupResponse { totalCount: number; brandList: BrandLookup[]; }
export interface SupplierLookupResponse { totalCount: number; supplierList: SupplierLookup[]; }
