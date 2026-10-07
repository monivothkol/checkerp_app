import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SAL34000Request, SAL34000Response } from "@/models/POS/SAL/SAL30000";

export default class RetrievePackagingDetail implements IRequest<SAL34000Request, SAL34000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrievePackagingDetail;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrievePackagingDetail {
        if (!this.instance) { this.instance = new RetrievePackagingDetail(); }
        return this.instance;
    }
    public request(option: RequestOption<SAL34000Request, SAL34000Response>) {
        this.networkService.request({
            trCode: "SAL34000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as SAL34000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
