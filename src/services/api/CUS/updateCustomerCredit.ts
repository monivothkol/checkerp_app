import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { CustomerCreditRequest, CustomerCreditResponse } from "@/models/POS/CRD/CRD10000";

export default class UpdateCustomerCredit implements IRequest<CustomerCreditRequest, CustomerCreditResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: UpdateCustomerCredit;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): UpdateCustomerCredit {
        if (!this.instance) { this.instance = new UpdateCustomerCredit(); }
        return this.instance;
    }
    public request(option: RequestOption<CustomerCreditRequest, CustomerCreditResponse>) {
        this.networkService.request({
            trCode: "CUS10000I03", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as CustomerCreditResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
