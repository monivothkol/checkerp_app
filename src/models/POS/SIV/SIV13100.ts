/** Invoice payment modal — SIV13100. */

export interface SIV13100PayPayload {
    saleCode: string;
    paymentMethodId: string;
    amount: number;
    receivedAmount?: number;
    referenceNumber?: string;
    notes?: string;
}

export interface SIV13100PayResponse {
    saleCode?: string;
    paidAmount?: number;
    totalAmount?: number;
    outstanding?: number;
    paymentStatus?: string;
}
