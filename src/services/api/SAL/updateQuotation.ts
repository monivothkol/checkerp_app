import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SAL17000UpdatePayload, SAL17000UpdateResponse } from "@/models/POS/SAL/SAL17000";

export default class UpdateQuotation implements IRequest<SAL17000UpdatePayload, SAL17000UpdateResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: UpdateQuotation;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): UpdateQuotation {
        if (!this.instance) {
            this.instance = new UpdateQuotation();
        }
        return this.instance;
    }

    public request(option: RequestOption<SAL17000UpdatePayload, SAL17000UpdateResponse>) {
        this.networkService.request({
            trCode: "SAL17000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as SAL17000UpdateResponse);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
