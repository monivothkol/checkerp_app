import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SAL31000Request, SAL31000Response } from "@/models/POS/SAL/SAL30000";

export default class RetrievePackagingDraft implements IRequest<SAL31000Request, SAL31000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrievePackagingDraft;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrievePackagingDraft {
        if (!this.instance) { this.instance = new RetrievePackagingDraft(); }
        return this.instance;
    }
    public request(option: RequestOption<SAL31000Request, SAL31000Response>) {
        this.networkService.request({
            trCode: "SAL31000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as SAL31000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
