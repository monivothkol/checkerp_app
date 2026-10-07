import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { PRM20000Request, PRM20000Response, AdjustmentRow } from "@/models/POS/PRM/PRM20000";

export default class RetrieveAdjustmentList implements IRequest<PRM20000Request, PRM20000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveAdjustmentList;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveAdjustmentList {
        if (!this.instance) {
            this.instance = new RetrieveAdjustmentList();
        }
        return this.instance;
    }

    public request(option: RequestOption<PRM20000Request, PRM20000Response>) {
        this.networkService.request({
            trCode: "PRM20000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: PRM20000Response = {
                totalCount: response.totalCount ?? 0,
                adjustmentList: (response.adjustmentList ?? []) as AdjustmentRow[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
