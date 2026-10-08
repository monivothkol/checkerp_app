import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { LVM11000PreviewRequest, LVM11000PreviewResponse } from "@/models/POS/LVM/LVM11000";

/** LVM11000I02 — leave days for a staff and date range (fixed days off excluded). */
export default class RetrieveLeaveDaysPreview implements IRequest<LVM11000PreviewRequest, LVM11000PreviewResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveLeaveDaysPreview;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveLeaveDaysPreview {
        if (!this.instance) {
            this.instance = new RetrieveLeaveDaysPreview();
        }
        return this.instance;
    }

    public request(option: RequestOption<LVM11000PreviewRequest, LVM11000PreviewResponse>) {
        this.networkService.request({
            trCode: "LVM11000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as LVM11000PreviewResponse);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
