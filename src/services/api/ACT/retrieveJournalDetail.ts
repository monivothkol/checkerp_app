import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";

export interface RetrieveJournalDetailRequest {
    journalNo: string;
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export default class RetrieveJournalDetail implements IRequest<RetrieveJournalDetailRequest, Record<string, any>> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveJournalDetail;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveJournalDetail {
        if (!this.instance) { this.instance = new RetrieveJournalDetail(); }
        return this.instance;
    }
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    public request(option: RequestOption<RetrieveJournalDetailRequest, Record<string, any>>) {
        this.networkService.request({
            trCode: "ACT20100I01",
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
