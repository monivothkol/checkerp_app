import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { PaymentMappingResponse } from "@/models/ACT/ACT41000";

/** ACT41000I01 - payment methods with their mapped GL account + cash-account options. */
export default class RetrievePaymentMappings implements IRequest<Record<string, never>, PaymentMappingResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrievePaymentMappings;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrievePaymentMappings {
        if (!this.instance) { this.instance = new RetrievePaymentMappings(); }
        return this.instance;
    }
    public request(option: RequestOption<Record<string, never>, PaymentMappingResponse>) {
        this.networkService.request({
            trCode: "ACT41000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as PaymentMappingResponse);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
