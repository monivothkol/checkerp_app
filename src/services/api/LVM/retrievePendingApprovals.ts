import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { PendingApprovalsRequest, PendingApprovalsResponse } from "@/models/POS/LVM/LVM10000";

/** LVM10000I02 - "my approvals" inbox: PENDING requests awaiting the caller. */
export default class RetrievePendingApprovals implements IRequest<PendingApprovalsRequest, PendingApprovalsResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrievePendingApprovals;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrievePendingApprovals {
        if (!this.instance) {
            this.instance = new RetrievePendingApprovals();
        }
        return this.instance;
    }

    public request(option: RequestOption<PendingApprovalsRequest, PendingApprovalsResponse>) {
        this.networkService.request({
            trCode: "LVM10000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as PendingApprovalsResponse);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
