import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";

export interface JournalEntryLinePayload {
    accountCode: string | undefined;
    description: string;
    /** Amounts are in `currency`; the backend converts to USD at `exchangeRate`. */
    currency: string;
    debitAmount: number;
    creditAmount: number;
}

export interface CreateJournalEntryPayload {
    entryDate: string;
    description: string;
    /** Units of the secondary currency per 1 USD; required when any line is not USD. */
    exchangeRate: number;
    lineList: JournalEntryLinePayload[];
}

export interface CreateJournalEntryResponse {
    journalNo?: string;
}

export default class CreateJournalEntry implements IRequest<CreateJournalEntryPayload, CreateJournalEntryResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: CreateJournalEntry;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): CreateJournalEntry {
        if (!this.instance) { this.instance = new CreateJournalEntry(); }
        return this.instance;
    }
    public request(option: RequestOption<CreateJournalEntryPayload, CreateJournalEntryResponse>) {
        this.networkService.request({
            trCode: "ACT20200I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as CreateJournalEntryResponse);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
