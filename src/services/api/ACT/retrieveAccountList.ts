import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { ActAccount } from "@/models/ACT/ACT40000";

export interface RetrieveAccountListRequest {
    searchKeyword?: string;
    accountType?: string;
}

export interface RetrieveAccountListResponse {
    accountList: ActAccount[];
}

export default class RetrieveAccountList implements IRequest<RetrieveAccountListRequest, RetrieveAccountListResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveAccountList;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveAccountList {
        if (!this.instance) { this.instance = new RetrieveAccountList(); }
        return this.instance;
    }
    public request(option: RequestOption<RetrieveAccountListRequest, RetrieveAccountListResponse>) {
        this.networkService.request({
            trCode: "ACT40000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: RetrieveAccountListResponse = {
                accountList: (response.accountList ?? []) as ActAccount[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
