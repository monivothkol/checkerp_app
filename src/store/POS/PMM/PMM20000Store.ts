import { defineStore } from "pinia";
import RetrieveCategoryList from "@/services/api/CAT/retrieveCategoryList";
import RetrieveBrandList from "@/services/api/BRD/retrieveBrandList";
import RetrieveProductList from "@/services/api/PRD/retrieveProductList";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";
import type { CategoryLookup, BrandLookup } from "@/models/POS/COMMON/lookups";
import type { ProductListItem } from "@/models/PRD/PRD10000";
import type { PromotionTarget, PromotionBundleItem, TargetOption, PMM20000CreatePayload } from "@/models/POS/PMM/PMM20000";

/** Translated summary strings the screen supplies for the confirm-screen display (i18n stays in the screen). */
export interface PromotionDraftLabels {
    type: string;
    reward: string;
    scope: string;
    period: string;
}

/** PMM20000 create-promotion form store: type-aware form state, shared lookups, and draft handoff to PMM30000. */
export const PMM20000Store = defineStore("PMM20000Store", {
    state: () => ({
        form: {
            promotionName: "",
            description: "",
            promotionType: "",
            isActive: true,
            maxUse: undefined as number | undefined,
            discountPercentage: undefined as number | undefined,
            maxDiscountAmount: undefined as number | undefined,
            discountPrice: undefined as number | undefined,
            buyQuantity: undefined as number | undefined,
            freeQuantity: undefined as number | undefined,
            applicationType: "" as string
        },
        dateRange: [] as string[],
        targets: [] as PromotionTarget[],
        bundleItems: [] as PromotionBundleItem[],
        targetPick: undefined as string | undefined,
        bundlePick: undefined as string | undefined,
        productResults: [] as ProductListItem[],
        categories: [] as CategoryLookup[],
        brands: [] as BrandLookup[],
        searching: false,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        categoryApi: RetrieveCategoryList.getInstance(),
        brandApi: RetrieveBrandList.getInstance(),
        productApi: RetrieveProductList.getInstance()
    }),
    getters: {
        isPercentage(state): boolean { return state.form.promotionType === "PERCENTAGE_DISCOUNT"; },
        isPriceOverride(state): boolean { return state.form.promotionType === "PRICE_OVERRIDE"; },
        isBuyXGetY(state): boolean { return state.form.promotionType === "BUY_X_GET_Y"; },
        isBundle(state): boolean { return state.form.promotionType === "BUNDLED_PACKAGE"; },
        // Buy-X / price-override always target products; percentage uses the chosen scope.
        targetScope(state): string {
            if (this.isBuyXGetY || this.isPriceOverride) return "PRODUCT";
            return state.form.applicationType;
        },
        showTargetPicker(state): boolean {
            return this.isBuyXGetY || this.isPriceOverride || (this.isPercentage && !!state.form.applicationType);
        },
        targetOptions(state): TargetOption[] {
            if (this.targetScope === "CATEGORY") return state.categories.map((c) => ({ id: c.categoryId, name: c.categoryName }));
            if (this.targetScope === "BRAND") return state.brands.map((b) => ({ id: b.brandId, name: b.brandName }));
            return state.productResults.map((p) => ({ id: p.productId, name: p.productName }));
        },
        canConfirm(state): boolean {
            if (!state.form.promotionName || !state.form.promotionType) return false;
            if (this.isPercentage) return Number(state.form.discountPercentage ?? 0) > 0;
            if (this.isPriceOverride) return Number(state.form.discountPrice ?? 0) > 0 && state.targets.length > 0;
            if (this.isBuyXGetY) return Number(state.form.buyQuantity ?? 0) > 0 && Number(state.form.freeQuantity ?? 0) > 0 && state.targets.length > 0;
            if (this.isBundle) return state.bundleItems.length > 0;
            return false;
        }
    },
    actions: {
        /** Percentage promos carry the chosen scope; bundles have none; the rest target products. */
        applicationTypeForSubmit(): string {
            if (this.isPercentage) return this.form.applicationType;
            return this.isBundle ? "" : "PRODUCT";
        },
        onTypeChange() {
            this.targets = [];
            this.bundleItems = [];
            this.form.applicationType = "";
        },
        onApplicationTypeChange() {
            this.targets = [];
        },
        loadCategories() {
            this.categoryApi.request({
                dataBody: { pageNo: 1, pageSize: 200, isActive: true },
                listener: {
                    onSuccess: (p: { categoryList?: CategoryLookup[] }) => { this.categories = p.categoryList ?? []; }
                }
            });
        },
        loadBrands() {
            this.brandApi.request({
                dataBody: { pageNo: 1, pageSize: 200, isActive: true },
                listener: {
                    onSuccess: (p: { brandList?: BrandLookup[] }) => { this.brands = p.brandList ?? []; }
                }
            });
        },
        onProductSearch(kw: string) {
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
        onTargetSearch(kw: string) {
            if (this.targetScope === "PRODUCT") this.onProductSearch(kw);
        },
        onPickTarget(id: string) {
            const opt = this.targetOptions.find((o) => o.id === id);
            this.targetPick = undefined;
            if (!opt || this.targets.some((t) => t.targetId === id)) return;
            this.targets.push({ targetType: this.targetScope, targetId: id, targetName: opt.name });
        },
        removeTarget(i: number) { this.targets.splice(i, 1); },
        /** `variant` is set when the product has variants (the screen asks first). */
        onPickBundle(id: string, variant?: { variantId: string; variantName?: string; sellingPrice?: number }) {
            const p = this.productResults.find((x) => x.productId === id);
            this.bundlePick = undefined;
            if (!p || this.bundleItems.some((b) => b.productId === id && b.variantId === variant?.variantId)) return;
            this.bundleItems.push({
                productId: p.productId,
                productCode: p.productCode,
                productName: p.productName,
                variantId: variant?.variantId,
                variantName: variant?.variantName,
                quantity: 1,
                bundlePrice: Number(variant?.sellingPrice ?? p.sellingPrice ?? 0)
            });
        },
        setBundleQty(i: number, v: number) { this.bundleItems[i].quantity = v || 1; },
        setBundlePrice(i: number, v: number) { this.bundleItems[i].bundlePrice = v || 0; },
        removeBundle(i: number) { this.bundleItems.splice(i, 1); },
        /** Validate + stash the PMM draft (type-aware payload); returns true when saved (screen then navigates). */
        buildAndSaveDraft(labels: PromotionDraftLabels): boolean {
            if (!this.canConfirm) return false;
            const payload: PMM20000CreatePayload = {
                promotionName: this.form.promotionName,
                description: this.form.description || undefined,
                promotionType: this.form.promotionType,
                isActive: this.form.isActive,
                startDate: this.dateRange?.[0] || undefined,
                endDate: this.dateRange?.[1] || undefined,
                maxUse: this.form.maxUse ?? undefined,
                discountPercentage: this.isPercentage ? this.form.discountPercentage : undefined,
                maxDiscountAmount: this.isPercentage ? this.form.maxDiscountAmount : undefined,
                discountPrice: this.isPriceOverride ? this.form.discountPrice : undefined,
                buyQuantity: this.isBuyXGetY ? this.form.buyQuantity : undefined,
                freeQuantity: this.isBuyXGetY ? this.form.freeQuantity : undefined,
                applicationType: this.applicationTypeForSubmit(),
                targets: this.isBundle ? [] : this.targets.map((t) => ({ targetType: t.targetType, targetId: t.targetId })),
                bundleItems: this.isBundle
                    ? this.bundleItems.map((b) => ({ productId: b.productId, variantId: b.variantId,
                        quantity: b.quantity, bundlePrice: b.bundlePrice }))
                    : []
            };
            ModuleFlowStore.saveDraft("PMM", {
                payload,
                idempotencyKey: crypto.randomUUID(),
                display: {
                    name: this.form.promotionName,
                    type: labels.type,
                    reward: labels.reward,
                    scope: labels.scope,
                    targets: this.targets.map((t) => t.targetName),
                    bundle: this.bundleItems.map((b) => ({ name: b.productName, qty: b.quantity, price: b.bundlePrice })),
                    period: labels.period,
                    isActive: this.form.isActive
                }
            });
            return true;
        }
    }
});
