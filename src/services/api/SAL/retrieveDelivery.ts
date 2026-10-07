import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SAL74000Request, SAL74000Response } from "@/models/POS/SAL/SAL40000";

export default class RetrieveDelivery implements IRequest<SAL74000Request, SAL74000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveDelivery;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveDelivery {
        if (!this.instance) { this.instance = new RetrieveDelivery(); }
        return this.instance;
    }
    public request(option: RequestOption<SAL74000Request, SAL74000Response>) {
        this.networkService.request({
            trCode: "SAL74000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as SAL74000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
