import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";

export interface ApproveTransferRequest { transferId: string; }
export interface ApproveTransferResponse { status: string; }

export default class ApproveTransfer implements IRequest<ApproveTransferRequest, ApproveTransferResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: ApproveTransfer;

    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): ApproveTransfer {
        if (!this.instance) { this.instance = new ApproveTransfer(); }
        return this.instance;
    }
    public request(option: RequestOption<ApproveTransferRequest, ApproveTransferResponse>) {
        this.networkService.request({
            trCode: "STK23000I02", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as ApproveTransferResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
