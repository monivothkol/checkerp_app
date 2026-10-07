import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";

export interface CancelTransferRequest { transferId: string; }
export interface CancelTransferResponse { status: string; }

export default class CancelTransfer implements IRequest<CancelTransferRequest, CancelTransferResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: CancelTransfer;

    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): CancelTransfer {
        if (!this.instance) { this.instance = new CancelTransfer(); }
        return this.instance;
    }
    public request(option: RequestOption<CancelTransferRequest, CancelTransferResponse>) {
        this.networkService.request({
            trCode: "STK23000I04", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as CancelTransferResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
