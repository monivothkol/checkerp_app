import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";

/** ADM17000 — deactivate a user (soft). */
export interface DeactivateUserRequest { targetUserId: string; }
export interface DeactivateUserResponse { userId: string; isActive: boolean; }

export default class DeactivateUser implements IRequest<DeactivateUserRequest, DeactivateUserResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: DeactivateUser;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): DeactivateUser {
        if (!this.instance) { this.instance = new DeactivateUser(); }
        return this.instance;
    }
    public request(option: RequestOption<DeactivateUserRequest, DeactivateUserResponse>) {
        this.networkService.request({
            trCode: "ADM10000I02", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as DeactivateUserResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
