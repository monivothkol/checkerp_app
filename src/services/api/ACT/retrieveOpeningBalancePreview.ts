import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { OpeningBalanceRequest, OpeningBalancePreviewResponse } from "@/models/ACT/ACT44000";

/** ACT44000I03 - per account: really held vs ledger vs gap (read-only). */
export default class RetrieveOpeningBalancePreview implements IRequest<OpeningBalanceRequest, OpeningBalancePreviewResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveOpeningBalancePreview;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveOpeningBalancePreview {
        if (!this.instance) { this.instance = new RetrieveOpeningBalancePreview(); }
        return this.instance;
    }
    public request(option: RequestOption<OpeningBalanceRequest, OpeningBalancePreviewResponse>) {
        this.networkService.request({
            trCode: "ACT44000I03",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as OpeningBalancePreviewResponse);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
