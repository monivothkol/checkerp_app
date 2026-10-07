import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { STK23000Response } from "@/models/POS/STK/STK23000";

export interface STK23000Request { transferCode: string; }

export default class RetrieveTransferDetail implements IRequest<STK23000Request, STK23000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveTransferDetail;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveTransferDetail {
        if (!this.instance) {
            this.instance = new RetrieveTransferDetail();
        }
        return this.instance;
    }

    public request(option: RequestOption<STK23000Request, STK23000Response>) {
        this.networkService.request({
            trCode: "STK23000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as STK23000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
