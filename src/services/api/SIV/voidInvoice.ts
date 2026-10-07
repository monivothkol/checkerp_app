import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SIV13000VoidResponse } from "@/models/POS/SIV/SIV13000";

export interface SIV13000VoidRequest {
    saleCode: string;
}

export default class VoidInvoice implements IRequest<SIV13000VoidRequest, SIV13000VoidResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: VoidInvoice;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): VoidInvoice {
        if (!this.instance) {
            this.instance = new VoidInvoice();
        }
        return this.instance;
    }

    public request(option: RequestOption<SIV13000VoidRequest, SIV13000VoidResponse>) {
        this.networkService.request({
            trCode: "SIV13000I03",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as SIV13000VoidResponse);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
