import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SIV14000Request, SIV14000Response } from "@/models/POS/SIV/SIV14000";

export default class RetrieveSalePersonList implements IRequest<SIV14000Request, SIV14000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveSalePersonList;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveSalePersonList {
        if (!this.instance) {
            this.instance = new RetrieveSalePersonList();
        }
        return this.instance;
    }

    public request(option: RequestOption<SIV14000Request, SIV14000Response>) {
        this.networkService.request({
            trCode: "SIV11000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as SIV14000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
