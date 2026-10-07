import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SavePaymentMappingRequest, SavePaymentMappingResponse } from "@/models/ACT/ACT41000";

/** ACT41000I02 - upsert/clear payment method → account mappings. */
export default class SavePaymentMappings implements IRequest<SavePaymentMappingRequest, SavePaymentMappingResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: SavePaymentMappings;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): SavePaymentMappings {
        if (!this.instance) { this.instance = new SavePaymentMappings(); }
        return this.instance;
    }
    public request(option: RequestOption<SavePaymentMappingRequest, SavePaymentMappingResponse>) {
        this.networkService.request({
            trCode: "ACT41000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as SavePaymentMappingResponse);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
