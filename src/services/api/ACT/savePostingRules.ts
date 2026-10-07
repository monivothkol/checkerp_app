import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SavePostingRuleRequest, SavePostingRuleResponse } from "@/models/ACT/ACT43000";

/** ACT43000I02 - set/clear posting-slot account overrides. */
export default class SavePostingRules implements IRequest<SavePostingRuleRequest, SavePostingRuleResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: SavePostingRules;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): SavePostingRules {
        if (!this.instance) { this.instance = new SavePostingRules(); }
        return this.instance;
    }
    public request(option: RequestOption<SavePostingRuleRequest, SavePostingRuleResponse>) {
        this.networkService.request({
            trCode: "ACT43000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as SavePostingRuleResponse);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
