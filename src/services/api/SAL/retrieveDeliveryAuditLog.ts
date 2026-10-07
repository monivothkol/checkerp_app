import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { InvoiceAuditEntry, InvoiceAuditResponse } from "@/models/POS/invoice";

/** SAL74000I02 — delivery edit change-history. */
export default class RetrieveDeliveryAuditLog implements IRequest<{ deliveryId: string }, InvoiceAuditResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveDeliveryAuditLog;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveDeliveryAuditLog {
        if (!this.instance) {
            this.instance = new RetrieveDeliveryAuditLog();
        }
        return this.instance;
    }

    public request(option: RequestOption<{ deliveryId: string }, InvoiceAuditResponse>) {
        this.networkService.request({
            trCode: "SAL74000I02",
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
