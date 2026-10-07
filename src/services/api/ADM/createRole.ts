import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { RoleCreateResult } from "@/models/POS/ADM/ADM20000";

export interface CreateRolePayload {
    roleName: string;
    description?: string;
    permissionCodes: string[];
}

export default class CreateRole implements IRequest<CreateRolePayload, RoleCreateResult> {
    private readonly networkService: HttpNetworkService;
    private static instance: CreateRole;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): CreateRole {
        if (!this.instance) { this.instance = new CreateRole(); }
        return this.instance;
    }
    public request(option: RequestOption<CreateRolePayload, RoleCreateResult>) {
        this.networkService.request({
            trCode: "ADM21000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as RoleCreateResult);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
