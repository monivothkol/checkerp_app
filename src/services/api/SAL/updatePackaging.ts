import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SAL37000UpdatePayload, SAL37000UpdateResponse } from "@/models/POS/SAL/SAL30000";

export default class UpdatePackaging implements IRequest<SAL37000UpdatePayload, SAL37000UpdateResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: UpdatePackaging;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): UpdatePackaging {
        if (!this.instance) {
            this.instance = new UpdatePackaging();
        }
        return this.instance;
    }

    public request(option: RequestOption<SAL37000UpdatePayload, SAL37000UpdateResponse>) {
        this.networkService.request({
            trCode: "SAL37000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as SAL37000UpdateResponse);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
