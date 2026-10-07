import { defineStore } from "pinia";
import CreateAsset from "@/services/api/AST/createAsset";
import UpdateAsset from "@/services/api/AST/updateAsset";
import RetrieveAssetDetail from "@/services/api/AST/retrieveAssetDetail";
import { DEPRECIABLE_TYPES, type AssetRow, type AssetType, type DepreciationMethod, type PaidFrom } from "@/models/POS/AST/AST10000";
import type { AssetDetailResponse } from "@/models/POS/AST/AST30000";

/** `assetId` is the saved asset, so the screen can open its detail. */
type Done = (ok: boolean, assetId?: string, error?: unknown) => void;

/**
 * AST20000 asset form store: create a new asset, or edit an existing one opened with
 * ?assetId= (cost, date and account are frozen once posted — only name, depreciation
 * settings and notes move).
 */
export const AST20000Store = defineStore("AST20000Store", {
    state: () => ({
        assetId: "" as string,
        assetName: "",
        assetType: "EQUIPMENT" as AssetType,
        cost: undefined as number | undefined,
        purchaseDate: undefined as string | undefined,
        salvageValue: 0 as number | undefined,
        usefulLifeMonths: 36 as number | undefined,
        depreciationMethod: "STRAIGHT_LINE" as DepreciationMethod,
        paidFrom: "CASH" as PaidFrom,
        serialNo: "",
        location: "",
        supplierName: "",
        remark: "",
        loading: false,
        submitting: false,
        createApi: CreateAsset.getInstance(),
        updateApi: UpdateAsset.getInstance(),
        detailApi: RetrieveAssetDetail.getInstance()
    }),
    getters: {
        isEdit: (s) => !!s.assetId,
        depreciable: (s) => DEPRECIABLE_TYPES.includes(s.assetType)
    },
    actions: {
        reset(asset?: AssetRow) {
            this.assetId = asset?.assetId ?? "";
            this.assetName = asset?.assetName ?? "";
            this.assetType = asset?.assetType ?? "EQUIPMENT";
            this.cost = asset ? Number(asset.cost) : undefined;
            this.purchaseDate = asset?.purchaseDate;
            this.salvageValue = asset ? Number(asset.salvageValue) : 0;
            this.usefulLifeMonths = asset ? asset.usefulLifeMonths : 36;
            this.depreciationMethod = asset?.depreciationMethod ?? "STRAIGHT_LINE";
            this.paidFrom = asset?.paidFrom ?? "CASH";
            this.serialNo = asset?.serialNo ?? "";
            this.location = asset?.location ?? "";
            this.supplierName = asset?.supplierName ?? "";
            this.remark = asset?.remark ?? "";
            this.submitting = false;
        },
        /** Edit: pull the saved asset into the form; a blank id means a new asset. */
        load(assetId: string) {
            this.reset();
            if (!assetId) return;
            this.loading = true;
            this.detailApi.request({
                dataBody: { assetId },
                listener: {
                    onSuccess: (detail: AssetDetailResponse) => { this.reset(detail); this.loading = false; },
                    onFail: () => { this.loading = false; }
                }
            });
        },
        /** Non-depreciable types (land, deposits, prepaid) carry no schedule. */
        onTypeChange() {
            if (!this.depreciable) this.depreciationMethod = "NONE";
            else if (this.depreciationMethod === "NONE") this.depreciationMethod = "STRAIGHT_LINE";
        },
        submit(onDone: Done) {
            this.submitting = true;
            const settings = {
                salvageValue: Number(this.salvageValue ?? 0),
                usefulLifeMonths: this.depreciable ? Number(this.usefulLifeMonths ?? 0) : 0,
                depreciationMethod: this.depreciable ? this.depreciationMethod : "NONE" as DepreciationMethod
            };
            const notes = {
                serialNo: this.serialNo || undefined,
                location: this.location || undefined,
                supplierName: this.supplierName || undefined,
                remark: this.remark || undefined
            };
            const listener = {
                onSuccess: (res: { assetId: string }) => { this.submitting = false; onDone(true, res.assetId); },
                onFail: (e: unknown) => { this.submitting = false; onDone(false, undefined, e); }
            };
            if (this.isEdit) {
                this.updateApi.request({ dataBody: { assetId: this.assetId, assetName: this.assetName.trim(), ...settings, ...notes }, listener });
                return;
            }
            this.createApi.request({
                dataBody: {
                    assetName: this.assetName.trim(),
                    assetType: this.assetType,
                    cost: Number(this.cost),
                    purchaseDate: this.purchaseDate as string,
                    paidFrom: this.paidFrom,
                    ...settings, ...notes
                },
                headers: { "Idempotency-Key": crypto.randomUUID() },
                listener
            });
        }
    }
});
