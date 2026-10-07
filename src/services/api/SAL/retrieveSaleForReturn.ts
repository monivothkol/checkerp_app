import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SAL25000Request, SaleReturnLookup, SaleReturnLookupItem } from "@/models/POS/SAL/SAL21000";

export default class RetrieveSaleForReturn implements IRequest<SAL25000Request, SaleReturnLookup> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveSaleForReturn;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveSaleForReturn {
        if (!this.instance) {
            this.instance = new RetrieveSaleForReturn();
        }
        return this.instance;
    }

    public request(option: RequestOption<SAL25000Request, SaleReturnLookup>) {
        this.networkService.request({
            trCode: "SAL21000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: SaleReturnLookup = {
                ...(response as SaleReturnLookup),
                items: (response.items ?? []) as SaleReturnLookupItem[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
