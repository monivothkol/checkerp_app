import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { ATD21000Request } from "@/models/POS/ATD/ATD20000";

export default class SaveRenewalTime implements IRequest<ATD21000Request, Record<string, unknown>> {
    private readonly networkService: HttpNetworkService;
    private static instance: SaveRenewalTime;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): SaveRenewalTime {
        if (!this.instance) {
            this.instance = new SaveRenewalTime();
        }
        return this.instance;
    }

    public request(option: RequestOption<ATD21000Request, Record<string, unknown>>) {
        this.networkService.request({
            trCode: "ATD20000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as Record<string, unknown>);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
