import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SAL41000Request, SAL41000Response } from "@/models/POS/SAL/SAL40000";

export default class RetrieveDeliveryContext implements IRequest<SAL41000Request, SAL41000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveDeliveryContext;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveDeliveryContext {
        if (!this.instance) { this.instance = new RetrieveDeliveryContext(); }
        return this.instance;
    }
    public request(option: RequestOption<SAL41000Request, SAL41000Response>) {
        this.networkService.request({
            trCode: "SAL41000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as SAL41000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
