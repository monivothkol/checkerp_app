import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { STK31000CreatePayload, STK31000Response } from "@/models/POS/STK/STK31000";

export default class CreateAdjustment implements IRequest<STK31000CreatePayload, STK31000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: CreateAdjustment;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): CreateAdjustment {
        if (!this.instance) {
            this.instance = new CreateAdjustment();
        }
        return this.instance;
    }

    public request(option: RequestOption<STK31000CreatePayload, STK31000Response>) {
        this.networkService.request({
            trCode: "STK31000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as STK31000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
