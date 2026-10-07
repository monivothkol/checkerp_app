import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SAL52000Request, SAL52000Response } from "@/models/POS/SAL/SAL40000";

export default class CreateDelivery implements IRequest<SAL52000Request, SAL52000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: CreateDelivery;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): CreateDelivery {
        if (!this.instance) { this.instance = new CreateDelivery(); }
        return this.instance;
    }
    public request(option: RequestOption<SAL52000Request, SAL52000Response>) {
        this.networkService.request({
            trCode: "SAL52000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as SAL52000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
