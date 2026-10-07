import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SUP17000Request, SUP17000Response, BalanceBill, BalancePurchaseReturn } from "@/models/POS/SUP/SUP17000";

export default class RetrieveSupplierBalance implements IRequest<SUP17000Request, SUP17000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveSupplierBalance;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveSupplierBalance {
        if (!this.instance) {
            this.instance = new RetrieveSupplierBalance();
        }
        return this.instance;
    }

    public request(option: RequestOption<SUP17000Request, SUP17000Response>) {
        this.networkService.request({
            trCode: "SUP17000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: SUP17000Response = {
                ...(response as SUP17000Response),
                bills: (response.bills ?? []) as BalanceBill[],
                purchaseReturns: (response.purchaseReturns ?? []) as BalancePurchaseReturn[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
