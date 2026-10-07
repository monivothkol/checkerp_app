import { defineStore } from "pinia";
import RetrievePackagingDetail from "@/services/api/SAL/retrievePackagingDetail";
import CancelPackaging from "@/services/api/SAL/cancelPackaging";
import POP from "@/core/utilities/pop";
import type { PackagingHeader, PackagingItem } from "@/models/POS/SAL/SAL30000";

/** SAL34000 packaging-detail store: detail load + cancel by packagingId. */
export const SAL34000Store = defineStore("SAL34000Store", {
    state: () => ({
        loading: true,
        packagingId: "",
        header: null as PackagingHeader | null,
        items: [] as PackagingItem[],
        detailApi: RetrievePackagingDetail.getInstance(),
        cancelApi: CancelPackaging.getInstance()
    }),
    actions: {
        load(packagingId: string) {
            if (!packagingId) { this.loading = false; return; }
            this.packagingId = packagingId;
            this.loading = true;
            this.detailApi.request({
                dataBody: { packagingId },
                listener: {
                    onSuccess: (resp) => {
                        // Tolerant read: header may be nested under `packaging`, items under `items` or `itemList`.
                        const p = resp as any;
                        const h = p?.packaging ?? p;
                        this.header = h && Object.keys(h).length ? h : null;
                        this.items = p?.items ?? p?.itemList ?? h?.items ?? h?.itemList ?? [];
                        this.loading = false;
                    },
                    onFail: () => { this.header = null; this.items = []; this.loading = false; }
                }
            });
        },
        /** Cancel then reload; `failTitle` is the already-translated alert title. */
        cancel(failTitle: string) {
            const id = this.packagingId;
            if (!id) return;
            this.cancelApi.request({
                dataBody: { packagingId: id },
                listener: {
                    onSuccess: () => { this.load(id); },
                    onFail: (err) => { POP.alert({ title: failTitle, status: "error", content: err?.message, errorCode: err?.code }); }
                }
            });
        }
    }
});
