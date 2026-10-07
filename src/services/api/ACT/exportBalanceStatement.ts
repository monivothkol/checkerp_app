import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { ExportBalanceStatementRequest, ExportBalanceStatementResponse } from "@/models/ACT/ACT35000";

/** ACT35100I01 — balance statement as a book-format PDF/Excel (presigned url). */
export default class ExportBalanceStatement
implements IRequest<ExportBalanceStatementRequest, ExportBalanceStatementResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: ExportBalanceStatement;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): ExportBalanceStatement {
        if (!this.instance) { this.instance = new ExportBalanceStatement(); }
        return this.instance;
    }
    public request(option: RequestOption<ExportBalanceStatementRequest, ExportBalanceStatementResponse>) {
        this.networkService.request({
            trCode: "ACT35100I01", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as ExportBalanceStatementResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
