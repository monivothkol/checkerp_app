import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { InvoiceAuditEntry, InvoiceAuditResponse } from "@/models/POS/invoice";

/** SAL24000I02 — sale-return edit change-history. */
export default class RetrieveSaleReturnAuditLog implements IRequest<{ returnId: string }, InvoiceAuditResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveSaleReturnAuditLog;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveSaleReturnAuditLog {
        if (!this.instance) {
            this.instance = new RetrieveSaleReturnAuditLog();
        }
        return this.instance;
    }

    public request(option: RequestOption<{ returnId: string }, InvoiceAuditResponse>) {
        this.networkService.request({
            trCode: "SAL24000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess({ auditList: (response.auditList ?? []) as InvoiceAuditEntry[] });
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
