/** Delivery (SAL40000-74000) models. */

export interface DeliveryRow {
    deliveryId: string;
    deliveryCode: string;
    saleId?: string;
    saleCode?: string;
    driverId?: string;
    driverName?: string;
    status: string;
    customerName?: string;
    customerPhone?: string;
    deliveryAddress?: string;
    scheduledDate?: string;
    createdAt?: string;
}
export interface SAL40000Request { status?: string; driverId?: string; searchKeyword?: string; pageNo?: number; pageSize?: number; }
export interface SAL40000Response { totalCount: number; deliveryList: DeliveryRow[]; }

/** A driver option (active staff) for the create form (SAL41000). */
export interface DeliveryDriver {
    driverId: string;
    driverName?: string;
    staffCode?: string;
}
export interface SAL41000Request { saleCode?: string; }
export interface SAL41000Response {
    drivers: DeliveryDriver[];
    /** Present when the request carried a saleCode (deep link). */
    sale?: { saleId: string; saleCode: string; customerId?: string; customerName?: string; customerPhone?: string; customerAddress?: string };
    addressList?: DeliveryAddress[];
}

/** Create payload (SAL52000). */
export interface DeliveryAddress {
    addressId: string;
    label?: string;
    address: string;
    latitude?: number | null;
    longitude?: number | null;
    isDefault?: boolean;
}
export interface SAL44000Request {
    customerId: string;
    label?: string;
    address: string;
    latitude?: number;
    longitude?: number;
    isDefault?: boolean;
}
export type SAL44000Response = DeliveryAddress;
export interface SAL42000Request { customerId: string; }
export interface SAL42000Response { addressList: DeliveryAddress[]; }

export interface SAL52000Request {
    deliveryLatitude?: number;
    deliveryLongitude?: number;
    saleId: string;
    driverId?: string;
    deliveryAddress?: string;
    scheduledDate?: string;
    notes?: string;
    customerName?: string;
    customerPhone?: string;
}
export interface SAL52000Response { deliveryId: string; deliveryCode: string; }

/** Advance status (SAL43000) — list row action. */
export interface SAL43000Request { deliveryId: string; status: string; }
export interface SAL43000Response { deliveryId: string; status: string; }

/** Detail / invoice (SAL74000). */
export interface DeliveryHeader {
    deliveryId: string;
    deliveryCode: string;
    saleId?: string;
    saleCode?: string;
    saleDate?: string;
    saleTotal?: number;
    driverId?: string;
    driverName?: string;
    status: string;
    customerName?: string;
    customerPhone?: string;
    deliveryAddress?: string;
    deliveryLatitude?: number | null;
    deliveryLongitude?: number | null;
    notes?: string;
    scheduledDate?: string;
    pickedUpAt?: string;
    deliveredAt?: string;
    createdAt?: string;
    store?: import("@/models/POS/invoice").InvoiceStore;
}
export interface DeliveryInvoiceItem {
    productCode?: string;
    productName?: string;
    unitName?: string;
    quantity: number;
    sortOrder?: number;
}
export interface SAL74000Request { deliveryId: string; }
export interface SAL74000Response { delivery: DeliveryHeader; items: DeliveryInvoiceItem[]; }
