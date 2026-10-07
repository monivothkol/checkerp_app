import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { PRM15000Response } from "@/models/POS/PRM/PRM15000";

export interface PRM15000Request {
    itemId: string;
}

export default class RetrievePayslipDetail implements IRequest<PRM15000Request, PRM15000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrievePayslipDetail;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrievePayslipDetail {
        if (!this.instance) {
            this.instance = new RetrievePayslipDetail();
        }
        return this.instance;
    }

    public request(option: RequestOption<PRM15000Request, PRM15000Response>) {
        this.networkService.request({
            trCode: "PRM15000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as PRM15000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
