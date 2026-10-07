import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";

export interface UpdateRolePayload {
    roleCode: string;
    roleName: string;
    description?: string;
    permissionCodes: string[];
}

export default class UpdateRole implements IRequest<UpdateRolePayload, Record<string, unknown>> {
    private readonly networkService: HttpNetworkService;
    private static instance: UpdateRole;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): UpdateRole {
        if (!this.instance) { this.instance = new UpdateRole(); }
        return this.instance;
    }
    public request(option: RequestOption<UpdateRolePayload, Record<string, unknown>>) {
        this.networkService.request({
            trCode: "ADM24000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as Record<string, unknown>);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
