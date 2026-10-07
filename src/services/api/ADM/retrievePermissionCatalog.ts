import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { RolePermission } from "@/models/POS/ADM/ADM20000";

export interface PermissionCatalogResponse {
    permissionList: RolePermission[];
}

export default class RetrievePermissionCatalog implements IRequest<Record<string, never>, PermissionCatalogResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrievePermissionCatalog;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrievePermissionCatalog {
        if (!this.instance) { this.instance = new RetrievePermissionCatalog(); }
        return this.instance;
    }
    public request(option: RequestOption<Record<string, never>, PermissionCatalogResponse>) {
        this.networkService.request({
            trCode: "ADM21000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: PermissionCatalogResponse = {
                permissionList: (response.permissionList ?? []) as RolePermission[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
