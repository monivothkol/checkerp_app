import { defineStore } from "pinia";
import RetrieveStoreInfo from "@/services/api/ADM/retrieveStoreInfo";
import UpdateStoreInfo from "@/services/api/ADM/updateStoreInfo";
import UploadStoreLogo from "@/services/api/ADM/uploadStoreLogo";
import POP from "@/core/utilities/pop";
import type { ModuleApiError } from "@/services/api/COMMON/module-api";

/** Translated alert messages passed from the screen (i18n stays in the screen). */
export interface SaveMessages {
    savedTitle: string;
    savedMsg: string;
    failedTitle: string;
}

/** ADM31000 store-info edit store: loads fixed + editable fields, saves, redirects on success. */
export const ADM31000Store = defineStore("ADM31000Store", {
    state: () => ({
        loading: true,
        saving: false,
        uploadingLogo: false,
        logoUrl: "",
        redirectTo: null as string | null,
        fixed: { companyCode: "", subdomain: "", currency: "" },
        form: {
            companyName: "",
            legalName: "",
            taxId: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
            timezone: "",
            invoiceTerms: ""
        },
        storeInfoApi: RetrieveStoreInfo.getInstance(),
        updateApi: UpdateStoreInfo.getInstance(),
        logoApi: UploadStoreLogo.getInstance()
    }),
    getters: {
        canSave(state): boolean {
            return (state.form.companyName ?? "").trim().length > 0;
        }
    },
    actions: {
        load() {
            this.loading = true;
            this.redirectTo = null;
            this.storeInfoApi.request({
                dataBody: {},
                listener: {
                    onSuccess: (p) => {
                        this.fixed.companyCode = p.companyCode ?? "";
                        this.fixed.subdomain = p.subdomain ?? "";
                        this.fixed.currency = p.currency ?? "";
                        this.form.companyName = p.companyName ?? "";
                        this.form.legalName = p.legalName ?? "";
                        this.form.taxId = p.taxId ?? "";
                        this.form.email = p.email ?? "";
                        this.form.phone = p.phone ?? "";
                        this.form.address = p.address ?? "";
                        this.form.city = p.city ?? "";
                        this.form.state = p.state ?? "";
                        this.form.postalCode = p.postalCode ?? "";
                        this.form.country = p.country ?? "";
                        this.form.timezone = p.timezone ?? "";
                        this.form.invoiceTerms = p.invoiceTerms ?? "";
                        this.logoUrl = p.logoUrl ?? "";
                        this.loading = false;
                    },
                    onFail: () => { this.loading = false; }
                }
            });
        },
        /** Upload a logo (data URI); on success the presigned url updates the preview. */
        uploadLogo(imageBase64: string, contentType: string, failedTitle: string) {
            if (this.uploadingLogo) return;
            this.uploadingLogo = true;
            this.logoApi.request({
                dataBody: { imageBase64, contentType },
                listener: {
                    onSuccess: (p) => { this.logoUrl = p.logoUrl ?? this.logoUrl; this.uploadingLogo = false; },
                    onFail: (err: ModuleApiError) => {
                        this.uploadingLogo = false;
                        POP.alert({ title: failedTitle, status: "error", content: err?.message ?? "", errorCode: err?.code });
                    }
                }
            });
        },
        save(msgs: SaveMessages) {
            if (this.saving || !this.canSave) return;
            this.saving = true;
            this.updateApi.request({
                dataBody: { ...this.form },
                listener: {
                    onSuccess: () => {
                        this.saving = false;
                        POP.alert({ title: msgs.savedTitle, status: "success", content: msgs.savedMsg });
                        this.redirectTo = "/ADM30000";
                    },
                    onFail: (err: ModuleApiError) => {
                        this.saving = false;
                        POP.alert({ title: msgs.failedTitle, status: "error", content: err?.message ?? "", errorCode: err?.code });
                    }
                }
            });
        }
    }
});
