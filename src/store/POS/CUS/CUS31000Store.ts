import { defineStore } from "pinia";
import RetrieveCategoryList from "@/services/api/CAT/retrieveCategoryList";
import RetrieveBrandList from "@/services/api/BRD/retrieveBrandList";
import RetrieveProductList from "@/services/api/PRD/retrieveProductList";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";
import { CONDITION_TYPES } from "@/core/modules/loyalty-condition";
import type { LoyaltyConditionType, CategoryOption, BrandOption, TargetOption } from "@/models/POS/CUS/CUS30000";
import type { ProductListItem } from "@/models/PRD/PRD10000";

/** CUS31000 loyalty-condition create form store: lookups, type-aware rule state, draft handoff to CUS32000. */
export const CUS31000Store = defineStore("CUS31000Store", {
    state: () => ({
        types: [...CONDITION_TYPES],
        form: {
            conditionName: "",
            conditionType: "" as LoyaltyConditionType | "",
            pointReward: undefined as number | undefined
        },
        amount: undefined as number | undefined,
        currency: "USD",
        targetId: undefined as string | undefined,
        targetName: "",
        productResults: [] as ProductListItem[],
        categories: [] as CategoryOption[],
        brands: [] as BrandOption[],
        searching: false,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        categoryApi: RetrieveCategoryList.getInstance(),
        brandApi: RetrieveBrandList.getInstance(),
        productApi: RetrieveProductList.getInstance()
    }),
    getters: {
        isAmount(state): boolean {
            return state.form.conditionType === "INVOICE_AMOUNT" || state.form.conditionType === "PAID_INVOICE_AMOUNT";
        },
        isTarget(state): boolean {
            return ["SPECIFIC_PRODUCT", "PRODUCT_CATEGORY", "PRODUCT_BRAND"].includes(state.form.conditionType);
        },
        targetScope(state): string {
            if (state.form.conditionType === "PRODUCT_CATEGORY") return "CATEGORY";
            if (state.form.conditionType === "PRODUCT_BRAND") return "BRAND";
            return "PRODUCT";
        },
        targetOptions(state): TargetOption[] {
            if (this.targetScope === "CATEGORY") return state.categories.map((c) => ({ id: c.categoryId, name: c.categoryName }));
            if (this.targetScope === "BRAND") return state.brands.map((b) => ({ id: b.brandId, name: b.brandName }));
            return state.productResults.map((p) => ({ id: p.productId, name: p.productName }));
        },
        canConfirm(state): boolean {
            if (!state.form.conditionName || !state.form.conditionType) return false;
            if (Number(state.form.pointReward ?? 0) <= 0) return false;
            if (this.isAmount) return Number(state.amount ?? 0) > 0;
            return !!state.targetId;
        }
    },
    actions: {
        onTypeChange() {
            this.targetId = undefined;
            this.targetName = "";
        },
        loadCategories() {
            this.categoryApi.request({
                dataBody: { pageNo: 1, pageSize: 200, isActive: true },
                listener: { onSuccess: (p: { categoryList?: CategoryOption[] }) => { this.categories = p.categoryList ?? []; } }
            });
        },
        loadBrands() {
            this.brandApi.request({
                dataBody: { pageNo: 1, pageSize: 200, isActive: true },
                listener: { onSuccess: (p: { brandList?: BrandOption[] }) => { this.brands = p.brandList ?? []; } }
            });
        },
        onTargetSearch(kw: string) {
            if (this.targetScope !== "PRODUCT") return;
            if (this.searchTimer) clearTimeout(this.searchTimer);
            this.searching = true;
            this.searchTimer = setTimeout(() => {
                this.productApi.request({
                    dataBody: { searchKeyword: kw, pageNo: 1, pageSize: 20, isActive: true },
                    listener: {
                        onSuccess: (p: { productList?: ProductListItem[] }) => { this.productResults = p.productList ?? []; this.searching = false; },
                        onFail: () => { this.searching = false; }
                    }
                });
            }, 250);
        },
        onPickTarget(id: string) {
            const opt = this.targetOptions.find((o) => o.id === id);
            this.targetName = opt?.name ?? "";
        },
        // conditionValue keeps v1's id key per type; targetName rides along for display.
        conditionValue(): Record<string, unknown> {
            if (this.isAmount) return { amount: this.amount, currency: this.currency };
            const idKey = { CATEGORY: "categoryId", BRAND: "brandId" }[this.targetScope] ?? "productId";
            return { [idKey]: this.targetId, targetName: this.targetName || undefined };
        },
        /**
         * Validate + stash the CUSL draft; returns true when saved (screen then navigates).
         * `typeLabel` is the already-translated condition-type text (i18n stays in the screen).
         */
        buildAndSaveDraft(typeLabel: string): boolean {
            if (!this.canConfirm) return false;
            const conditionText = this.isAmount
                ? `≥ ${Number(this.amount ?? 0)} ${this.currency}`
                : this.targetName;
            ModuleFlowStore.saveDraft("CUSL", {
                payload: {
                    conditionName: this.form.conditionName,
                    conditionType: this.form.conditionType,
                    conditionValue: JSON.stringify(this.conditionValue()),
                    pointReward: this.form.pointReward
                },
                idempotencyKey: crypto.randomUUID(),
                display: {
                    name: this.form.conditionName,
                    type: typeLabel,
                    condition: conditionText,
                    points: Number(this.form.pointReward ?? 0)
                }
            });
            return true;
        }
    }
});
