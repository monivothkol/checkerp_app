import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";

export interface POS14000Request {
    amount: number;
    billNumber?: string;
    customerName?: string;
}

export interface POS14000Response {
    qr?: string;
    md5?: string;
    transactionId?: string;
    expiresAt?: number;
    verifiable?: boolean;
}

export default class GenerateKhqr implements IRequest<POS14000Request, POS14000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: GenerateKhqr;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): GenerateKhqr {
        if (!this.instance) {
            this.instance = new GenerateKhqr();
        }
        return this.instance;
    }

    public request(option: RequestOption<POS14000Request, POS14000Response>) {
        this.networkService.request({
            trCode: "POS11000I03",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as POS14000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
