import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SAL43000Request, SAL43000Response } from "@/models/POS/SAL/SAL40000";

export default class UpdateDeliveryStatus implements IRequest<SAL43000Request, SAL43000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: UpdateDeliveryStatus;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): UpdateDeliveryStatus {
        if (!this.instance) { this.instance = new UpdateDeliveryStatus(); }
        return this.instance;
    }
    public request(option: RequestOption<SAL43000Request, SAL43000Response>) {
        this.networkService.request({
            trCode: "SAL40000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as SAL43000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
