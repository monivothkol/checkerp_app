import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { LVM21000Request } from "@/models/POS/LVM/LVM20000";

export default class CreateLeaveType implements IRequest<LVM21000Request, Record<string, unknown>> {
    private readonly networkService: HttpNetworkService;
    private static instance: CreateLeaveType;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): CreateLeaveType {
        if (!this.instance) {
            this.instance = new CreateLeaveType();
        }
        return this.instance;
    }

    public request(option: RequestOption<LVM21000Request, Record<string, unknown>>) {
        this.networkService.request({
            trCode: "LVM20000I02",
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
