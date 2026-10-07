/** Customer credit check (POS17000). */

export interface CreditCheckRequest {
    customerId: string;
    amount: number;
}

export interface CreditCheckResponse {
    allowed: boolean;
    blocked: boolean;
    message?: string;
    outstanding?: number;
    creditLimit?: number | null;
    overdueDays?: number;
    newBalance?: number;
}
