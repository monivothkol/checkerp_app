import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { StatementExportRequest, StatementExportResponse } from "@/models/ACT/statement-export";

/** ACT36100I01 — VAT return as a book-format PDF/Excel (presigned url). */
export default class ExportVatReturn
implements IRequest<StatementExportRequest, StatementExportResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: ExportVatReturn;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): ExportVatReturn {
        if (!this.instance) { this.instance = new ExportVatReturn(); }
        return this.instance;
    }
    public request(option: RequestOption<StatementExportRequest, StatementExportResponse>) {
        this.networkService.request({
            trCode: "ACT36100I01", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as StatementExportResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
