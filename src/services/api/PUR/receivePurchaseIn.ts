import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";

export interface PUR20000ReceiveRequest { adjustmentId: string; }
export interface PUR20000ReceiveResponse { adjustmentId?: string; status?: string; }

export default class ReceivePurchaseIn implements IRequest<PUR20000ReceiveRequest, PUR20000ReceiveResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: ReceivePurchaseIn;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): ReceivePurchaseIn {
        if (!this.instance) {
            this.instance = new ReceivePurchaseIn();
        }
        return this.instance;
    }

    public request(option: RequestOption<PUR20000ReceiveRequest, PUR20000ReceiveResponse>) {
        this.networkService.request({
            trCode: "PUR20000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as PUR20000ReceiveResponse);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
