import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { STK20000Request, STK20000Response, TransferRow } from "@/models/POS/STK/STK20000";

export default class RetrieveTransferList implements IRequest<STK20000Request, STK20000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveTransferList;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveTransferList {
        if (!this.instance) {
            this.instance = new RetrieveTransferList();
        }
        return this.instance;
    }

    public request(option: RequestOption<STK20000Request, STK20000Response>) {
        this.networkService.request({
            trCode: "STK20000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: STK20000Response = {
                totalCount: response.totalCount ?? 0,
                transferList: (response.transferList ?? []) as TransferRow[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
