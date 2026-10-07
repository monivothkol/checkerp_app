import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SAL32000Request, SAL32000Response } from "@/models/POS/SAL/SAL30000";

export default class CreatePackaging implements IRequest<SAL32000Request, SAL32000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: CreatePackaging;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): CreatePackaging {
        if (!this.instance) { this.instance = new CreatePackaging(); }
        return this.instance;
    }
    public request(option: RequestOption<SAL32000Request, SAL32000Response>) {
        this.networkService.request({
            trCode: "SAL32000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as SAL32000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
