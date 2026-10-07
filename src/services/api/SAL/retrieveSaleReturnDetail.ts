import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SAL24000Response } from "@/models/POS/SAL/SAL24000";

export interface SAL24000Request {
    returnId: string;
}

export default class RetrieveSaleReturnDetail implements IRequest<SAL24000Request, SAL24000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveSaleReturnDetail;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveSaleReturnDetail {
        if (!this.instance) {
            this.instance = new RetrieveSaleReturnDetail();
        }
        return this.instance;
    }

    public request(option: RequestOption<SAL24000Request, SAL24000Response>) {
        this.networkService.request({
            trCode: "SAL24000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as SAL24000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
