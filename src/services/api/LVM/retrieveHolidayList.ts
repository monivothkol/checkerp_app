import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { LVM30000Request, LVM30000Response, Holiday } from "@/models/POS/LVM/LVM30000";

export default class RetrieveHolidayList implements IRequest<LVM30000Request, LVM30000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveHolidayList;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveHolidayList {
        if (!this.instance) {
            this.instance = new RetrieveHolidayList();
        }
        return this.instance;
    }

    public request(option: RequestOption<LVM30000Request, LVM30000Response>) {
        this.networkService.request({
            trCode: "LVM30000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: LVM30000Response = {
                holidayList: (response.holidayList ?? []) as Holiday[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
