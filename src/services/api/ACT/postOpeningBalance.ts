import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { OpeningBalanceRequest, OpeningBalancePostResponse } from "@/models/ACT/ACT44000";

/** ACT44000I04 - post the gaps as one opening-balance entry. */
export default class PostOpeningBalance implements IRequest<OpeningBalanceRequest, OpeningBalancePostResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: PostOpeningBalance;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): PostOpeningBalance {
        if (!this.instance) { this.instance = new PostOpeningBalance(); }
        return this.instance;
    }
    public request(option: RequestOption<OpeningBalanceRequest, OpeningBalancePostResponse>) {
        this.networkService.request({
            trCode: "ACT44000I04",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as OpeningBalancePostResponse);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
