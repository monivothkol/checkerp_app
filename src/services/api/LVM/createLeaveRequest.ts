import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { LVM11000Request, LVM11000Response } from "@/models/POS/LVM/LVM10000";

export default class CreateLeaveRequest implements IRequest<LVM11000Request, LVM11000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: CreateLeaveRequest;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): CreateLeaveRequest {
        if (!this.instance) {
            this.instance = new CreateLeaveRequest();
        }
        return this.instance;
    }

    public request(option: RequestOption<LVM11000Request, LVM11000Response>) {
        this.networkService.request({
            trCode: "LVM11000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as LVM11000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
