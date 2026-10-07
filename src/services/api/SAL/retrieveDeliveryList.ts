import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SAL40000Request, SAL40000Response } from "@/models/POS/SAL/SAL40000";

export default class RetrieveDeliveryList implements IRequest<SAL40000Request, SAL40000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveDeliveryList;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveDeliveryList {
        if (!this.instance) { this.instance = new RetrieveDeliveryList(); }
        return this.instance;
    }
    public request(option: RequestOption<SAL40000Request, SAL40000Response>) {
        this.networkService.request({
            trCode: "SAL40000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as SAL40000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
