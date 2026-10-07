import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { ADM10000Request, ADM10000Response, UserRow } from "@/models/POS/ADM/ADM10000";

export default class RetrieveUserList implements IRequest<ADM10000Request, ADM10000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveUserList;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveUserList {
        if (!this.instance) { this.instance = new RetrieveUserList(); }
        return this.instance;
    }
    public request(option: RequestOption<ADM10000Request, ADM10000Response>) {
        this.networkService.request({
            trCode: "ADM10000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: ADM10000Response = {
                totalCount: response.totalCount ?? 0,
                userList: (response.userList ?? []) as UserRow[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
