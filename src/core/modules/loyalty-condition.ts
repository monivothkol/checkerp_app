/**
 * Loyalty point condition helpers (CUS3x000). conditionValue is a JSON string
 * whose shape depends on conditionType — same contract as v1:
 *   INVOICE_AMOUNT / PAID_INVOICE_AMOUNT -> { amount, currency }
 *   SPECIFIC_PRODUCT  -> { productId }
 *   PRODUCT_CATEGORY  -> { categoryId }
 *   PRODUCT_BRAND     -> { brandId }
 */

import type { LoyaltyConditionType } from "@/models/POS/CUS/CUS30000";

export const CONDITION_TYPES: readonly LoyaltyConditionType[] = [
    "INVOICE_AMOUNT",
    "PAID_INVOICE_AMOUNT",
    "SPECIFIC_PRODUCT",
    "PRODUCT_CATEGORY",
    "PRODUCT_BRAND"
] as const;

/** Decoded conditionValue JSON — keys present depend on the condition type. */
export interface ConditionValue {
    amount?: number;
    currency?: string;
    productId?: string;
    categoryId?: string;
    brandId?: string;
    targetName?: string;
}

export function parseConditionValue(raw: unknown): ConditionValue {
    if (raw && typeof raw === "object") return raw as ConditionValue;
    try {
        return JSON.parse(typeof raw === "string" ? raw : "{}") as ConditionValue;
    } catch {
        return {};
    }
}

/** Compact human summary of a condition ("≥ 150 USD", "Product: Coke ..."). */
export function conditionSummary(type: string, raw: unknown): string {
    const v = parseConditionValue(raw);
    switch (type) {
        case "INVOICE_AMOUNT":
        case "PAID_INVOICE_AMOUNT":
            return `≥ ${Number(v.amount ?? 0)} ${v.currency ?? "USD"}`;
        case "SPECIFIC_PRODUCT":
            return v.targetName ? String(v.targetName) : String(v.productId ?? "—");
        case "PRODUCT_CATEGORY":
            return v.targetName ? String(v.targetName) : String(v.categoryId ?? "—");
        case "PRODUCT_BRAND":
            return v.targetName ? String(v.targetName) : String(v.brandId ?? "—");
        default:
            return "—";
    }
}
