import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";

export interface POS15000Request {
    md5: string;
    transactionId: string;
}

export interface POS15000Response {
    paid?: boolean;
    expired?: boolean;
}

export default class PollKhqrStatus implements IRequest<POS15000Request, POS15000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: PollKhqrStatus;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): PollKhqrStatus {
        if (!this.instance) {
            this.instance = new PollKhqrStatus();
        }
        return this.instance;
    }

    public request(option: RequestOption<POS15000Request, POS15000Response>) {
        this.networkService.request({
            trCode: "POS11000I04",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as POS15000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
