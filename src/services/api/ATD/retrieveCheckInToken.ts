import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { ATD20000Response } from "@/models/POS/ATD/ATD20000";

export default class RetrieveCheckInToken implements IRequest<Record<string, unknown>, ATD20000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveCheckInToken;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveCheckInToken {
        if (!this.instance) {
            this.instance = new RetrieveCheckInToken();
        }
        return this.instance;
    }

    public request(option: RequestOption<Record<string, unknown>, ATD20000Response>) {
        this.networkService.request({
            trCode: "ATD20000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as ATD20000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
