import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { ATD41000Request, ATD41000Response } from "@/models/POS/ATD/ATD20000";

export default class SubmitCheckIn implements IRequest<ATD41000Request, ATD41000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: SubmitCheckIn;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): SubmitCheckIn {
        if (!this.instance) {
            this.instance = new SubmitCheckIn();
        }
        return this.instance;
    }

    public request(option: RequestOption<ATD41000Request, ATD41000Response>) {
        this.networkService.request({
            trCode: "ATD40000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as ATD41000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
