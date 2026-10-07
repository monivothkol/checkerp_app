import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";

export type POS11000CreatePayload = Record<string, unknown>;

export interface POS11000CreateResponse {
    saleCode?: string;
}

export default class CreatePosSale implements IRequest<POS11000CreatePayload, POS11000CreateResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: CreatePosSale;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): CreatePosSale {
        if (!this.instance) {
            this.instance = new CreatePosSale();
        }
        return this.instance;
    }

    public request(option: RequestOption<POS11000CreatePayload, POS11000CreateResponse>) {
        this.networkService.request({
            trCode: "POS11000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as POS11000CreateResponse);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
