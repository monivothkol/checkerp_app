import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { StatementExportRequest, StatementExportResponse } from "@/models/ACT/statement-export";

/** ACT31100I01 — statement of financial position as a book-format PDF/Excel (presigned url). */
export default class ExportBalanceSheet
implements IRequest<StatementExportRequest, StatementExportResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: ExportBalanceSheet;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): ExportBalanceSheet {
        if (!this.instance) { this.instance = new ExportBalanceSheet(); }
        return this.instance;
    }
    public request(option: RequestOption<StatementExportRequest, StatementExportResponse>) {
        this.networkService.request({
            trCode: "ACT31100I01", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as StatementExportResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
