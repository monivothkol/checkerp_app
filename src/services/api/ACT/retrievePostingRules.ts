import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { PostingRuleResponse } from "@/models/ACT/ACT43000";

/** ACT43000I01 - posting slots with default/override/effective account + options. */
export default class RetrievePostingRules implements IRequest<Record<string, never>, PostingRuleResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrievePostingRules;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrievePostingRules {
        if (!this.instance) { this.instance = new RetrievePostingRules(); }
        return this.instance;
    }
    public request(option: RequestOption<Record<string, never>, PostingRuleResponse>) {
        this.networkService.request({
            trCode: "ACT43000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as PostingRuleResponse);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
