import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SetReconciledRequest, SetReconciledResponse } from "@/models/ACT/ACT23000";

/** ACT23000I02 - mark or unmark a journal line as cleared. */
export default class SetReconciled implements IRequest<SetReconciledRequest, SetReconciledResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: SetReconciled;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): SetReconciled {
        if (!this.instance) { this.instance = new SetReconciled(); }
        return this.instance;
    }
    public request(option: RequestOption<SetReconciledRequest, SetReconciledResponse>) {
        this.networkService.request({
            trCode: "ACT23000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as SetReconciledResponse);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
