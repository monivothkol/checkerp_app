import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { ADM24000Response } from "@/models/POS/ADM/ADM20000";

export interface RetrieveRoleDetailRequest {
    roleCode: string;
}

export default class RetrieveRoleDetail implements IRequest<RetrieveRoleDetailRequest, ADM24000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveRoleDetail;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveRoleDetail {
        if (!this.instance) { this.instance = new RetrieveRoleDetail(); }
        return this.instance;
    }
    public request(option: RequestOption<RetrieveRoleDetailRequest, ADM24000Response>) {
        this.networkService.request({
            trCode: "ADM24000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as ADM24000Response);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
