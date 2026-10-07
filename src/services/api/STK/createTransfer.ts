import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { STK21000CreatePayload, STK21000Response } from "@/models/POS/STK/STK21000";

export default class CreateTransfer implements IRequest<STK21000CreatePayload, STK21000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: CreateTransfer;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): CreateTransfer {
        if (!this.instance) {
            this.instance = new CreateTransfer();
        }
        return this.instance;
    }

    public request(option: RequestOption<STK21000CreatePayload, STK21000Response>) {
        this.networkService.request({
            trCode: "STK21000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as STK21000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
