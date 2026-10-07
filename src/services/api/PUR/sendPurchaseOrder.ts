import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";

export interface PUR14000SendRequest { poId: string; }
export interface PUR14000SendResponse { poId?: string; status?: string; }

export default class SendPurchaseOrder implements IRequest<PUR14000SendRequest, PUR14000SendResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: SendPurchaseOrder;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): SendPurchaseOrder {
        if (!this.instance) { this.instance = new SendPurchaseOrder(); }
        return this.instance;
    }
    public request(option: RequestOption<PUR14000SendRequest, PUR14000SendResponse>) {
        this.networkService.request({
            trCode: "PUR14000I05", reqBody: option.dataBody,
            enableLoading: option.enableLoading, stateProps: option.stateProps,
            loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as PUR14000SendResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
