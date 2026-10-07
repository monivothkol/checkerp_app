import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { ActJournalRow } from "@/models/ACT/ACT40000";

export interface RetrieveJournalListRequest {
    searchKeyword?: string;
    sourceType?: string;
    journalStatusCode?: string;
    fromDate?: string;
    toDate?: string;
    pageNo?: number;
    pageSize?: number;
}

export interface RetrieveJournalListResponse {
    totalCount: number;
    journalList: ActJournalRow[];
}

export default class RetrieveJournalList implements IRequest<RetrieveJournalListRequest, RetrieveJournalListResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveJournalList;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveJournalList {
        if (!this.instance) { this.instance = new RetrieveJournalList(); }
        return this.instance;
    }
    public request(option: RequestOption<RetrieveJournalListRequest, RetrieveJournalListResponse>) {
        this.networkService.request({
            trCode: "ACT20000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: RetrieveJournalListResponse = {
                totalCount: response.totalCount ?? 0,
                journalList: (response.journalList ?? []) as ActJournalRow[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
