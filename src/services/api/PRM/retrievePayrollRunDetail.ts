import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { PRM14000Response } from "@/models/POS/PRM/PRM14000";

export interface PRM14000Request {
    runId: string;
}

export default class RetrievePayrollRunDetail implements IRequest<PRM14000Request, PRM14000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrievePayrollRunDetail;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrievePayrollRunDetail {
        if (!this.instance) {
            this.instance = new RetrievePayrollRunDetail();
        }
        return this.instance;
    }

    public request(option: RequestOption<PRM14000Request, PRM14000Response>) {
        this.networkService.request({
            trCode: "PRM14000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as PRM14000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
