import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { CMM02000I01Request, CMM02000I01Response } from "@/models/COMMON/CMM02000I01";

/**
 * CMM02000I01 - common tenant reference data (payment methods, banks, currency,
 * sale flags). Fetched once and cached in IndexedDB; the WebSocket invalidates it.
 */
export default class RetrieveReferenceData implements IRequest<CMM02000I01Request, CMM02000I01Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveReferenceData;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveReferenceData {
        if (!this.instance) {
            this.instance = new RetrieveReferenceData();
        }
        return this.instance;
    }

    public request(option: RequestOption<CMM02000I01Request, CMM02000I01Response>) {
        this.networkService.request({
            trCode: "CMM02000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as CMM02000I01Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
