import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";

export interface POS18000Request {
    customerId: string;
    lines: { productId: string; variantId?: string }[];
}
export interface POS18000Response { priceList: { productId: string; variantId?: string; groupPrice: number }[]; }

export default class RetrieveGroupPriceQuote implements IRequest<POS18000Request, POS18000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveGroupPriceQuote;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveGroupPriceQuote {
        if (!this.instance) {
            this.instance = new RetrieveGroupPriceQuote();
        }
        return this.instance;
    }

    public request(option: RequestOption<POS18000Request, POS18000Response>) {
        this.networkService.request({
            trCode: "POS11000I06",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as POS18000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
