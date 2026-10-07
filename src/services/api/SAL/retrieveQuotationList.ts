import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SAL11000Request, SAL11000Response, QuotationRow } from "@/models/POS/SAL/SAL11000";

export default class RetrieveQuotationList implements IRequest<SAL11000Request, SAL11000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveQuotationList;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveQuotationList {
        if (!this.instance) {
            this.instance = new RetrieveQuotationList();
        }
        return this.instance;
    }

    public request(option: RequestOption<SAL11000Request, SAL11000Response>) {
        this.networkService.request({
            trCode: "SAL11000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: SAL11000Response = {
                totalCount: response.totalCount ?? 0,
                totals: response.totals,
                quotationList: (response.quotationList ?? []) as QuotationRow[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
