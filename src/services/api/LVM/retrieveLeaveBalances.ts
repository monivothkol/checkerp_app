import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { LeaveBalanceRequest, LeaveBalanceResponse } from "@/models/POS/LVM/LVM40000";

/** LVM40000I01 - a staff's leave balances for a year (auto-initialized on first read). */
export default class RetrieveLeaveBalances implements IRequest<LeaveBalanceRequest, LeaveBalanceResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveLeaveBalances;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveLeaveBalances {
        if (!this.instance) {
            this.instance = new RetrieveLeaveBalances();
        }
        return this.instance;
    }

    public request(option: RequestOption<LeaveBalanceRequest, LeaveBalanceResponse>) {
        this.networkService.request({
            trCode: "LVM40000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as LeaveBalanceResponse);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
