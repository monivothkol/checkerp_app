import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SAL35000Request, SAL35000Response } from "@/models/POS/SAL/SAL30000";

export default class PackPackagingItem implements IRequest<SAL35000Request, SAL35000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: PackPackagingItem;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): PackPackagingItem {
        if (!this.instance) { this.instance = new PackPackagingItem(); }
        return this.instance;
    }
    public request(option: RequestOption<SAL35000Request, SAL35000Response>) {
        this.networkService.request({
            trCode: "SAL35000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as SAL35000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
