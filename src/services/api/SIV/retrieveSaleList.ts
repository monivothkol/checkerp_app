import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SIV10000Request, SIV10000Response, SaleRow } from "@/models/POS/SIV/SIV10000";

export default class RetrieveSaleList implements IRequest<SIV10000Request, SIV10000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveSaleList;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveSaleList {
        if (!this.instance) {
            this.instance = new RetrieveSaleList();
        }
        return this.instance;
    }

    public request(option: RequestOption<SIV10000Request, SIV10000Response>) {
        this.networkService.request({
            trCode: "SIV10000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: SIV10000Response = {
                totalCount: response.totalCount ?? 0,
                costVisible: response.costVisible === true,
                totals: response.totals,
                saleList: (response.saleList ?? []) as SaleRow[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
