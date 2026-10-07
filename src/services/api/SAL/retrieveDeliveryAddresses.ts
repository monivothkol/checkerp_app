import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SAL42000Request, SAL42000Response } from "@/models/POS/SAL/SAL40000";

export default class RetrieveDeliveryAddresses implements IRequest<SAL42000Request, SAL42000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveDeliveryAddresses;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveDeliveryAddresses {
        if (!this.instance) {
            this.instance = new RetrieveDeliveryAddresses();
        }
        return this.instance;
    }

    public request(option: RequestOption<SAL42000Request, SAL42000Response>) {
        this.networkService.request({
            trCode: "SAL41000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as SAL42000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
