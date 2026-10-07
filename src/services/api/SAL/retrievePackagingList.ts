import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SAL30000Request, SAL30000Response } from "@/models/POS/SAL/SAL30000";

export default class RetrievePackagingList implements IRequest<SAL30000Request, SAL30000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrievePackagingList;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrievePackagingList {
        if (!this.instance) { this.instance = new RetrievePackagingList(); }
        return this.instance;
    }
    public request(option: RequestOption<SAL30000Request, SAL30000Response>) {
        this.networkService.request({
            trCode: "SAL30000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as SAL30000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
