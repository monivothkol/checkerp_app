import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SAL12000CreatePayload, SAL12000Response } from "@/models/POS/SAL/SAL12000";

export default class CreateQuotation implements IRequest<SAL12000CreatePayload, SAL12000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: CreateQuotation;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): CreateQuotation {
        if (!this.instance) {
            this.instance = new CreateQuotation();
        }
        return this.instance;
    }

    public request(option: RequestOption<SAL12000CreatePayload, SAL12000Response>) {
        this.networkService.request({
            trCode: "SAL12000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as SAL12000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
