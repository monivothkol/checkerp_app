import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";

export interface ReverseJournalPayload {
    journalNo: string;
    reason: string;
}

export interface ReverseJournalResponse {
    journalNo?: string;
}

export default class ReverseJournal implements IRequest<ReverseJournalPayload, ReverseJournalResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: ReverseJournal;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): ReverseJournal {
        if (!this.instance) { this.instance = new ReverseJournal(); }
        return this.instance;
    }
    public request(option: RequestOption<ReverseJournalPayload, ReverseJournalResponse>) {
        this.networkService.request({
            trCode: "ACT20000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as ReverseJournalResponse);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
