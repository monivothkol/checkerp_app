import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SAL27000UpdatePayload, SAL27000UpdateResponse } from "@/models/POS/SAL/SAL27000";

export default class UpdateSaleReturn implements IRequest<SAL27000UpdatePayload, SAL27000UpdateResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: UpdateSaleReturn;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): UpdateSaleReturn {
        if (!this.instance) {
            this.instance = new UpdateSaleReturn();
        }
        return this.instance;
    }

    public request(option: RequestOption<SAL27000UpdatePayload, SAL27000UpdateResponse>) {
        this.networkService.request({
            trCode: "SAL27000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as SAL27000UpdateResponse);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
