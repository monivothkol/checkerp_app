import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { InvoiceAuditResponse } from "@/models/POS/invoice";

export interface SIV13000AuditRequest {
    saleCode: string;
}

export default class RetrieveInvoiceAuditLog implements IRequest<SIV13000AuditRequest, InvoiceAuditResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveInvoiceAuditLog;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveInvoiceAuditLog {
        if (!this.instance) {
            this.instance = new RetrieveInvoiceAuditLog();
        }
        return this.instance;
    }

    public request(option: RequestOption<SIV13000AuditRequest, InvoiceAuditResponse>) {
        this.networkService.request({
            trCode: "SIV13000I04",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as InvoiceAuditResponse);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
