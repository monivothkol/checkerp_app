import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { LVM31000Request } from "@/models/POS/LVM/LVM30000";

export default class CreateHoliday implements IRequest<LVM31000Request, Record<string, unknown>> {
    private readonly networkService: HttpNetworkService;
    private static instance: CreateHoliday;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): CreateHoliday {
        if (!this.instance) {
            this.instance = new CreateHoliday();
        }
        return this.instance;
    }

    public request(option: RequestOption<LVM31000Request, Record<string, unknown>>) {
        this.networkService.request({
            trCode: "LVM30000I02",
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
