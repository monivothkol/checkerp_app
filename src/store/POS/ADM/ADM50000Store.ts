import { defineStore } from "pinia";
import RetrieveSaleSettings from "@/services/api/ADM/retrieveSaleSettings";
import SaveSaleSettings from "@/services/api/ADM/saveSaleSettings";
import POP from "@/core/utilities/pop";
import type { ModuleApiError } from "@/services/api/COMMON/module-api";
import type { SaveMessages } from "@/store/POS/ADM/ADM31000Store";
import ModuleApi from "@/services/api/COMMON/module-api";
import type { TaxOption } from "@/models/POS/ADM/ADM50000";

/** ADM50000 sale-settings store: load + save in place. */
export const ADM50000Store = defineStore("ADM50000Store", {
    state: () => ({
        loading: true,
        saving: false,
        form: {
            allowDelayedPayment: false, enableProductPromotion: false, allowCustomPrice: true, allowSellWithoutStock: false,
            allowDifferentSaleDate: false, customerPayVat: true, allowDuplicateLineItems: false,
            primaryCurrency: "USD", secondaryCurrency: "KHR", exchangeRate: 4100,
            useProductSecondaryCodeInInvoice: false, primaryProductIdentifier: "PRODUCT_CODE", showSalePersonNicknameOnInvoice: false,
            invoiceInfoSource: "STORE",
            enableCreditControl: false, creditGateLimit: true, creditGateOverdueAmount: true, creditGateOverdueDays: false,
            defaultSalesTaxId: null as string | null, defaultPurchaseTaxId: null as string | null, pricesIncludeTax: false
        },
        taxes: [] as TaxOption[],
        retrieveApi: RetrieveSaleSettings.getInstance(),
        saveApi: SaveSaleSettings.getInstance()
    }),
    getters: {
        salesTaxOptions(state): TaxOption[] {
            return state.taxes.filter((t) => t.appliesTo !== "PURCHASE");
        },
        purchaseTaxOptions(state): TaxOption[] {
            return state.taxes.filter((t) => t.appliesTo !== "SALES");
        }
    },
    actions: {
        /** Active tax catalog for the two default pickers (TAX10000 is the source of truth). */
        loadTaxes() {
            ModuleApi.request<{ taxList?: TaxOption[] }>("TAX10000I01", { activeOnly: true, pageNo: 1, pageSize: 100 }, {
                onSuccess: (p) => { this.taxes = p.taxList ?? []; },
                onFail: () => { this.taxes = []; }
            });
        },
        load() {
            this.loading = true;
            this.retrieveApi.request({
                dataBody: {},
                listener: {
                    onSuccess: (p) => {
                        // Copy only the settings keys the form owns, skipping null/undefined.
                        const target = this.form as Record<string, unknown>;
                        for (const [k, v] of Object.entries(p) as [string, unknown][]) {
                            if (v !== undefined && v !== null && k in this.form) target[k] = v;
                        }
                        this.loading = false;
                    },
                    onFail: () => { this.loading = false; }
                }
            });
        },
        save(msgs: SaveMessages) {
            this.saving = true;
            this.saveApi.request({
                dataBody: { ...this.form },
                listener: {
                    onSuccess: () => {
                        this.saving = false;
                        POP.alert({ title: msgs.savedTitle, status: "success", content: msgs.savedMsg });
                        this.load();
                    },
                    onFail: (e: ModuleApiError) => {
                        this.saving = false;
                        POP.alert({ title: msgs.failedTitle, status: "error", content: e?.message, errorCode: e?.code });
                    }
                }
            });
        }
    }
});
