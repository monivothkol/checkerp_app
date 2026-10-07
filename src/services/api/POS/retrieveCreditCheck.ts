import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { CreditCheckRequest, CreditCheckResponse } from "@/models/POS/SAL/credit";

export default class RetrieveCreditCheck implements IRequest<CreditCheckRequest, CreditCheckResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveCreditCheck;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveCreditCheck {
        if (!this.instance) { this.instance = new RetrieveCreditCheck(); }
        return this.instance;
    }
    public request(option: RequestOption<CreditCheckRequest, CreditCheckResponse>) {
        this.networkService.request({
            trCode: "POS11000I05",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as CreditCheckResponse);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
