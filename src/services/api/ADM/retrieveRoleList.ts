import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { RoleOption } from "@/models/POS/ADM/ADM11000";

export interface RetrieveRoleListRequest {
    searchKeyword?: string;
    pageNo?: number;
    pageSize?: number;
}

export interface RetrieveRoleListResponse {
    totalCount: number;
    roleList: RoleOption[];
}

export default class RetrieveRoleList implements IRequest<RetrieveRoleListRequest, RetrieveRoleListResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveRoleList;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveRoleList {
        if (!this.instance) { this.instance = new RetrieveRoleList(); }
        return this.instance;
    }
    public request(option: RequestOption<RetrieveRoleListRequest, RetrieveRoleListResponse>) {
        this.networkService.request({
            trCode: "ADM20000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: RetrieveRoleListResponse = {
                totalCount: response.totalCount ?? 0,
                roleList: (response.roleList ?? []) as RoleOption[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
