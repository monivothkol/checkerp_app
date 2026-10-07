import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SAL36000Request, SAL36000Response } from "@/models/POS/SAL/SAL30000";

export default class CancelPackaging implements IRequest<SAL36000Request, SAL36000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: CancelPackaging;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): CancelPackaging {
        if (!this.instance) { this.instance = new CancelPackaging(); }
        return this.instance;
    }
    public request(option: RequestOption<SAL36000Request, SAL36000Response>) {
        this.networkService.request({
            trCode: "SAL34000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as SAL36000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
