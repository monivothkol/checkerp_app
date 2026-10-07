import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { CUS17000Request, CUS17000Response, BalanceInvoice, BalanceStockReturn } from "@/models/POS/CUS/CUS17000";

export default class RetrieveCustomerBalance implements IRequest<CUS17000Request, CUS17000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveCustomerBalance;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveCustomerBalance {
        if (!this.instance) {
            this.instance = new RetrieveCustomerBalance();
        }
        return this.instance;
    }

    public request(option: RequestOption<CUS17000Request, CUS17000Response>) {
        this.networkService.request({
            trCode: "CUS17000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: CUS17000Response = {
                ...(response as CUS17000Response),
                invoices: (response.invoices ?? []) as BalanceInvoice[],
                stockReturns: (response.stockReturns ?? []) as BalanceStockReturn[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
