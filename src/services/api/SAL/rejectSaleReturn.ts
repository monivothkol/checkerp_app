import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";

export interface SAL27000Request {
    returnId: string;
}

export interface SAL27000Response {
    returnId?: string;
    returnCode?: string;
    status?: string;
    creditNoteCode?: string;
    grossAmount?: number;
}

export default class RejectSaleReturn implements IRequest<SAL27000Request, SAL27000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RejectSaleReturn;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RejectSaleReturn {
        if (!this.instance) {
            this.instance = new RejectSaleReturn();
        }
        return this.instance;
    }

    public request(option: RequestOption<SAL27000Request, SAL27000Response>) {
        this.networkService.request({
            trCode: "SAL20000I03",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as SAL27000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
