import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { ReconcileListRequest, ReconcileListResponse } from "@/models/ACT/ACT23000";

/** ACT23000I01 - an account's journal lines with their cleared marks + summary. */
export default class RetrieveReconciliation implements IRequest<ReconcileListRequest, ReconcileListResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveReconciliation;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveReconciliation {
        if (!this.instance) { this.instance = new RetrieveReconciliation(); }
        return this.instance;
    }
    public request(option: RequestOption<ReconcileListRequest, ReconcileListResponse>) {
        this.networkService.request({
            trCode: "ACT23000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as ReconcileListResponse);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
