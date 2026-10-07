import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";

export interface SAL26000Request {
    returnId: string;
}

export interface SAL26000Response {
    returnId?: string;
    returnCode?: string;
    status?: string;
    creditNoteCode?: string;
    grossAmount?: number;
}

export default class ApproveSaleReturn implements IRequest<SAL26000Request, SAL26000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: ApproveSaleReturn;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): ApproveSaleReturn {
        if (!this.instance) {
            this.instance = new ApproveSaleReturn();
        }
        return this.instance;
    }

    public request(option: RequestOption<SAL26000Request, SAL26000Response>) {
        this.networkService.request({
            trCode: "SAL20000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as SAL26000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
