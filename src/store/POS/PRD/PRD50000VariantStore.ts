import { defineStore } from "pinia";
import ModuleApi from "@/services/api/COMMON/module-api";
import type { ProductVariant, StockAllocation, UnallocatedStock, VariantAttribute, VariantDraft, VariantListResponse } from "@/models/POS/PRD/ProductVariant";

/**
 * Product variants editor state. Everything is held here as a draft — attributes,
 * generated combinations, edits and removals — and only reaches the database when
 * the product create/edit form is submitted (the payload carries the whole set).
 */
/** Matches the server-side cap in ProductVariantServiceImpl. */
const GENERATE_LIMIT = 500;

export const PRD50000VariantStore = defineStore("PRD50000VariantStore", {
    state: () => ({
        productId: "",
        loading: false,
        /** The saved set is in (or there is none to load). Until then a save would send an empty set. */
        loaded: false,
        /** Loading the saved set failed: saving must stay blocked (it would wipe the variants). */
        failed: false,
        attributes: [] as VariantAttribute[],
        variants: [] as ProductVariant[],
        /** Local key for rows that have no id yet (a table needs a stable row key). */
        nextKey: 1,
        /** The row being added (no variantId) or edited; null when none. */
        draft: null as ProductVariant | null,
        /** Stock the product holds on its variant-less row, per inventory. */
        onHand: [] as UnallocatedStock[],
        /** How much of it goes to each variant: allocated[inventoryId][rowKey]. */
        allocated: {} as Record<string, Record<string, number>>
    }),
    getters: {
        rows(state): ProductVariant[] {
            const d = state.draft;
            return d && !d.variantId && !state.variants.includes(d) ? [d, ...state.variants] : state.variants;
        },
        /** What the product create/edit payload carries. */
        payload(): VariantDraft {
            return {
                stockAllocation: this.stockAllocation,
                attributeList: this.attributes
                    .filter((a) => a.attributeName.trim() && a.options.length)
                    .map((a) => ({ attributeId: a.attributeId, attributeName: a.attributeName.trim(), options: [...a.options] })),
                variantList: this.variants.map((v) => ({ ...v, rowKey: undefined }))
            };
        },
        /** Allocation lines, keyed back to saved variants (a new variant gets its id on save). */
        stockAllocation(): StockAllocation[] {
            return this.onHand.map((row) => ({
                inventoryId: row.inventoryId,
                lines: this.variants
                    .map((v, index) => ({ variantId: v.variantId, index, qty: this.allocated[row.inventoryId]?.[v.rowKey ?? ""] ?? 0 }))
                    .filter((l) => l.qty > 0)
                    .map((l) => ({ variantId: l.variantId, variantIndex: l.index, quantity: l.qty }))
            })).filter((a) => a.lines.length > 0);
        },
        /** What is still unplaced per inventory — the form warns before it is written off. */
        remaining(): { inventoryId: string; inventoryName: string; left: number }[] {
            return this.onHand.map((row) => ({
                inventoryId: row.inventoryId,
                inventoryName: row.inventoryName,
                left: Number(row.quantity ?? 0) - Object.values(this.allocated[row.inventoryId] ?? {}).reduce((s, n) => s + (n || 0), 0)
            }));
        }
    },
    actions: {
        /** Edit: load the product's saved set. Create: start empty. */
        load(productId?: string) {
            this.$reset();
            this.productId = productId ?? "";
            if (!productId) {
                this.loaded = true;
                return;
            }
            this.loading = true;
            ModuleApi.request<VariantListResponse>("PRD50000I05", { productId }, {
                onSuccess: (p) => {
                    this.attributes = (p.attributeList ?? []).map((a) => ({ ...a, options: [...(a.options ?? [])] }));
                    this.variants = (p.variantList ?? []).map((v) => this.keyed(v));
                    this.onHand = p.unallocatedStock ?? [];
                    this.loading = false;
                    this.loaded = true;
                },
                onFail: () => { this.attributes = []; this.variants = []; this.loading = false; this.failed = true; }
            });
        },
        keyed(v: ProductVariant): ProductVariant {
            return { ...v, rowKey: v.variantId || `new-${this.nextKey++}` };
        },
        addAttribute() {
            this.attributes.push({ attributeName: "", options: [] });
        },
        removeAttribute(index: number) {
            this.attributes.splice(index, 1);
        },
        /** Every option combination that has no variant yet, added as new rows. -1 = over the limit. */
        generate(): number {
            const usable = this.attributes.filter((a) => a.attributeName.trim() && a.options.length);
            if (!usable.length) return 0;
            let combos: Record<string, string>[] = [{}];
            for (const a of usable) {
                combos = combos.flatMap((c) => a.options.map((o) => ({ ...c, [a.attributeName.trim()]: o })));
            }
            const taken = new Set(this.variants.map((v) => this.comboKey(v.attributes)));
            const fresh = combos.filter((c) => !taken.has(this.comboKey(c)));
            if (this.variants.length + fresh.length > GENERATE_LIMIT) return -1; // the server refuses more too
            for (const attributes of fresh) {
                this.variants.push(this.keyed({ variantId: "", attributes, isActive: true, variantName: "",
                    variantCode: "", variantCodeSecondary: "", barcode: "" }));
            }
            return fresh.length;
        },
        comboKey(attributes: Record<string, string>): string {
            return Object.keys(attributes).sort((a, b) => a.localeCompare(b)).map((k) => `${k}=${attributes[k]}`).join("|");
        },
        startAdd() {
            this.draft = { variantId: "", attributes: {}, isActive: true, variantName: "",
                variantCode: "", variantCodeSecondary: "", barcode: "" };
        },
        startEdit(row: ProductVariant) {
            this.draft = { ...row, attributes: { ...row.attributes } };
        },
        cancelEdit() {
            this.draft = null;
        },
        /** Commit the inline row into the local list (nothing is sent to the server yet). */
        saveDraft() {
            const d = this.draft;
            if (!d) return;
            const at = this.variants.findIndex((v) => v.rowKey === d.rowKey);
            if (at >= 0) {
                this.variants[at] = { ...d };
            } else {
                this.variants.push(this.keyed(d));
            }
            this.draft = null;
        },
        setAllocation(inventoryId: string, rowKey: string, quantity: number) {
            const forInventory = this.allocated[inventoryId] ?? {};
            forInventory[rowKey] = Math.max(quantity, 0);
            this.allocated[inventoryId] = forInventory;
        },
        remove(row: ProductVariant) {
            const at = this.variants.findIndex((v) => v.rowKey === row.rowKey);
            if (at >= 0) this.variants.splice(at, 1);
            if (this.draft?.rowKey === row.rowKey) this.draft = null;
        },
        /** True once a saved variant is dropped or a product gains its first variant. */
        hasVariants(): boolean {
            return this.variants.some((v) => v.isActive);
        }
    }
});

export type VariantPayload = VariantDraft;
