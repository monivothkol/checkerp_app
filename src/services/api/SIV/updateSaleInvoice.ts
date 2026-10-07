import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SIV15000UpdatePayload, SIV15000UpdateResponse } from "@/models/POS/SIV/SIV15000";

export default class UpdateSaleInvoice implements IRequest<SIV15000UpdatePayload, SIV15000UpdateResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: UpdateSaleInvoice;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): UpdateSaleInvoice {
        if (!this.instance) {
            this.instance = new UpdateSaleInvoice();
        }
        return this.instance;
    }

    public request(option: RequestOption<SIV15000UpdatePayload, SIV15000UpdateResponse>) {
        this.networkService.request({
            trCode: "SIV15000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as SIV15000UpdateResponse);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
