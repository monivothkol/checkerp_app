import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SAL20000Request, SAL20000Response, ReturnRow } from "@/models/POS/SAL/SAL20000";

export default class RetrieveSaleReturnList implements IRequest<SAL20000Request, SAL20000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveSaleReturnList;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveSaleReturnList {
        if (!this.instance) {
            this.instance = new RetrieveSaleReturnList();
        }
        return this.instance;
    }

    public request(option: RequestOption<SAL20000Request, SAL20000Response>) {
        this.networkService.request({
            trCode: "SAL20000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: SAL20000Response = {
                totalCount: response.totalCount ?? 0,
                totals: response.totals,
                returnList: (response.returnList ?? []) as ReturnRow[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
