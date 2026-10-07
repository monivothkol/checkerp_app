import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";

export interface RejectTransferRequest { transferId: string; }
export interface RejectTransferResponse { status: string; }

export default class RejectTransfer implements IRequest<RejectTransferRequest, RejectTransferResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RejectTransfer;

    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RejectTransfer {
        if (!this.instance) { this.instance = new RejectTransfer(); }
        return this.instance;
    }
    public request(option: RequestOption<RejectTransferRequest, RejectTransferResponse>) {
        this.networkService.request({
            trCode: "STK23000I03", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as RejectTransferResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
