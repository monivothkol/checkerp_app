import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { PRM10000Request, PRM10000Response, PayrollRunRow } from "@/models/POS/PRM/PRM10000";

export default class RetrievePayrollRunList implements IRequest<PRM10000Request, PRM10000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrievePayrollRunList;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrievePayrollRunList {
        if (!this.instance) {
            this.instance = new RetrievePayrollRunList();
        }
        return this.instance;
    }

    public request(option: RequestOption<PRM10000Request, PRM10000Response>) {
        this.networkService.request({
            trCode: "PRM10000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: PRM10000Response = {
                totalCount: response.totalCount ?? 0,
                totals: response.totals,
                runList: (response.runList ?? []) as PayrollRunRow[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
