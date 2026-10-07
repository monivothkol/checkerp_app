import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SIV13100PayPayload, SIV13100PayResponse } from "@/models/POS/SIV/SIV13100";

export default class CreateInvoicePayment implements IRequest<SIV13100PayPayload, SIV13100PayResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: CreateInvoicePayment;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): CreateInvoicePayment {
        if (!this.instance) {
            this.instance = new CreateInvoicePayment();
        }
        return this.instance;
    }

    public request(option: RequestOption<SIV13100PayPayload, SIV13100PayResponse>) {
        this.networkService.request({
            trCode: "SIV13000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as SIV13100PayResponse);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
