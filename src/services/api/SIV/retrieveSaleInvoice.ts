import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SaleInvoice } from "@/models/POS/invoice";

export interface SIV13000Request {
    saleCode: string;
}

export default class RetrieveSaleInvoice implements IRequest<SIV13000Request, SaleInvoice> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveSaleInvoice;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveSaleInvoice {
        if (!this.instance) {
            this.instance = new RetrieveSaleInvoice();
        }
        return this.instance;
    }

    public request(option: RequestOption<SIV13000Request, SaleInvoice>) {
        this.networkService.request({
            trCode: "SIV13000I01",
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
