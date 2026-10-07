import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { PMM50000Response } from "@/models/POS/PMM/PMM50000";

export interface PMM50000Request {
    promotionCode: string;
}

export default class RetrievePromotionDetail implements IRequest<PMM50000Request, PMM50000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrievePromotionDetail;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrievePromotionDetail {
        if (!this.instance) {
            this.instance = new RetrievePromotionDetail();
        }
        return this.instance;
    }

    public request(option: RequestOption<PMM50000Request, PMM50000Response>) {
        this.networkService.request({
            trCode: "PMM50000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as PMM50000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
