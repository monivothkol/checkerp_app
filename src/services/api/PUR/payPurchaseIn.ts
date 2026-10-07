import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";

export interface PUR20000PayRequest {
    adjustmentId: string;
    amount: number;
    paymentMethodId: string;
    referenceNumber?: string;
    notes?: string;
}
export interface PUR20000PayResponse { adjustmentId?: string; paidAmount?: number; outstanding?: number; }

export default class PayPurchaseIn implements IRequest<PUR20000PayRequest, PUR20000PayResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: PayPurchaseIn;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): PayPurchaseIn {
        if (!this.instance) { this.instance = new PayPurchaseIn(); }
        return this.instance;
    }
    public request(option: RequestOption<PUR20000PayRequest, PUR20000PayResponse>) {
        this.networkService.request({
            trCode: "PUR20000I03", reqBody: option.dataBody,
            enableLoading: option.enableLoading, stateProps: option.stateProps,
            loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as PUR20000PayResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
