import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";

export interface RetrieveAccountLedgerRequest {
    fromDate: string;
    toDate: string;
    accountCodes?: string[];
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export default class RetrieveAccountLedger implements IRequest<RetrieveAccountLedgerRequest, Record<string, any>> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveAccountLedger;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveAccountLedger {
        if (!this.instance) { this.instance = new RetrieveAccountLedger(); }
        return this.instance;
    }
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    public request(option: RequestOption<RetrieveAccountLedgerRequest, Record<string, any>>) {
        this.networkService.request({
            trCode: "ACT33000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            option.listener?.onSuccess(response as Record<string, any>);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
