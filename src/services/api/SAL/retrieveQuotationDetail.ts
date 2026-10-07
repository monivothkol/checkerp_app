import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SAL15000Response } from "@/models/POS/SAL/SAL15000";

export interface SAL15000Request {
    quotationNo: string;
}

export default class RetrieveQuotationDetail implements IRequest<SAL15000Request, SAL15000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveQuotationDetail;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveQuotationDetail {
        if (!this.instance) {
            this.instance = new RetrieveQuotationDetail();
        }
        return this.instance;
    }

    public request(option: RequestOption<SAL15000Request, SAL15000Response>) {
        this.networkService.request({
            trCode: "SAL15000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as SAL15000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
