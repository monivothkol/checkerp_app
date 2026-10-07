import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";

/** ADM18000 — admin reset of a user's password. */
export interface ResetUserPasswordRequest { targetUserId: string; password: string; }
export interface ResetUserPasswordResponse { userId: string; }

export default class ResetUserPassword implements IRequest<ResetUserPasswordRequest, ResetUserPasswordResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: ResetUserPassword;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): ResetUserPassword {
        if (!this.instance) { this.instance = new ResetUserPassword(); }
        return this.instance;
    }
    public request(option: RequestOption<ResetUserPasswordRequest, ResetUserPasswordResponse>) {
        this.networkService.request({
            trCode: "ADM10000I03", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as ResetUserPasswordResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
