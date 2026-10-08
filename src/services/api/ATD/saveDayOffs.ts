import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { ATD60000SaveRequest, ATD60000SaveResponse } from "@/models/POS/ATD/ATD60000";

/** ATD60000I02 — set who is off on a date (optionally repeated weekly). */
export default class SaveDayOffs implements IRequest<ATD60000SaveRequest, ATD60000SaveResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: SaveDayOffs;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): SaveDayOffs {
        if (!this.instance) {
            this.instance = new SaveDayOffs();
        }
        return this.instance;
    }

    public request(option: RequestOption<ATD60000SaveRequest, ATD60000SaveResponse>) {
        this.networkService.request({
            trCode: "ATD60000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as ATD60000SaveResponse);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
