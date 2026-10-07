import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SaleInvoice } from "@/models/POS/invoice";

export interface POS12000Request {
    saleCode: string;
}

export default class RetrievePosInvoice implements IRequest<POS12000Request, SaleInvoice> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrievePosInvoice;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrievePosInvoice {
        if (!this.instance) {
            this.instance = new RetrievePosInvoice();
        }
        return this.instance;
    }

    public request(option: RequestOption<POS12000Request, SaleInvoice>) {
        this.networkService.request({
            trCode: "POS12000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as SaleInvoice);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
