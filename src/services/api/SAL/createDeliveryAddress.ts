import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SAL44000Request, SAL44000Response } from "@/models/POS/SAL/SAL40000";

export default class CreateDeliveryAddress implements IRequest<SAL44000Request, SAL44000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: CreateDeliveryAddress;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): CreateDeliveryAddress {
        if (!this.instance) {
            this.instance = new CreateDeliveryAddress();
        }
        return this.instance;
    }

    public request(option: RequestOption<SAL44000Request, SAL44000Response>) {
        this.networkService.request({
            trCode: "SAL41000I03",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as SAL44000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
