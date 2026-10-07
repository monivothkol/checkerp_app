import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";

/** ADM16000 — update a user (profile/role/active + optional password reset). */
export interface UpdateUserRequest {
    targetUserId: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    roleId: string;
    staffId?: string;
    isActive: boolean;
    password?: string;
}
export interface UpdateUserResponse { userId: string; }

export default class UpdateUser implements IRequest<UpdateUserRequest, UpdateUserResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: UpdateUser;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): UpdateUser {
        if (!this.instance) { this.instance = new UpdateUser(); }
        return this.instance;
    }
    public request(option: RequestOption<UpdateUserRequest, UpdateUserResponse>) {
        this.networkService.request({
            trCode: "ADM14000I02", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as UpdateUserResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
