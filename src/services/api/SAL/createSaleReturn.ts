import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SAL21000CreatePayload, SAL21000Response } from "@/models/POS/SAL/SAL21000";

export default class CreateSaleReturn implements IRequest<SAL21000CreatePayload, SAL21000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: CreateSaleReturn;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): CreateSaleReturn {
        if (!this.instance) {
            this.instance = new CreateSaleReturn();
        }
        return this.instance;
    }

    public request(option: RequestOption<SAL21000CreatePayload, SAL21000Response>) {
        this.networkService.request({
            trCode: "SAL21000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as SAL21000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
