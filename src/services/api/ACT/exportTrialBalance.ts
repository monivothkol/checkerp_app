import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { StatementExportRequest, StatementExportResponse } from "@/models/ACT/statement-export";

/** ACT32100I01 — trial balance as a book-format PDF/Excel (presigned url). */
export default class ExportTrialBalance
implements IRequest<StatementExportRequest, StatementExportResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: ExportTrialBalance;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): ExportTrialBalance {
        if (!this.instance) { this.instance = new ExportTrialBalance(); }
        return this.instance;
    }
    public request(option: RequestOption<StatementExportRequest, StatementExportResponse>) {
        this.networkService.request({
            trCode: "ACT32100I01", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as StatementExportResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
