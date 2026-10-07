/** Credit policy (general credit condition) models — CRD10000/11000/12000. */

export interface CreditPolicyRow {
    creditPolicyId: string;
    code?: string;
    name: string;
    creditLimit?: number | null;
    creditTermDays?: number | null;
    maxOverdueAmount?: number | null;
    behaviorOnCreditExceeded?: string;
    behaviorOnOverdue?: string;
    applyTo?: string;
    isDefault?: boolean;
    isActive?: boolean;
}

export interface CRD10000Request { activeOnly?: boolean; }
export interface CRD10000Response { creditPolicyList: CreditPolicyRow[]; }

/** Create/update payload. creditPolicyId present = update (CRD12000), else create (CRD11000). */
export interface CreditPolicySaveRequest {
    creditPolicyId?: string;
    name: string;
    creditLimit?: number | null;
    creditTermDays?: number | null;
    maxOverdueAmount?: number | null;
    behaviorOnCreditExceeded?: string;
    behaviorOnOverdue?: string;
    applyTo?: string;
    isDefault?: boolean;
    isActive?: boolean;
}
export interface CreditPolicySaveResponse { creditPolicyId: string; code?: string; }

/** Per-customer credit assignment (CUS40000). */
export interface CustomerCreditRequest {
    customerId: string;
    creditPolicyId?: string;
    creditLimitOverride?: number | null;
    creditTermOverride?: number | null;
    maxOverdueOverride?: number | null;
}
export interface CustomerCreditResponse { customerId: string; }
