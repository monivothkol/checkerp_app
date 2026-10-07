import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { LookupRequest, StaffLookupResponse, StaffLookup } from "@/models/POS/COMMON/lookups";

export default class RetrieveStaffList implements IRequest<LookupRequest, StaffLookupResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveStaffList;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveStaffList {
        if (!this.instance) {
            this.instance = new RetrieveStaffList();
        }
        return this.instance;
    }

    public request(option: RequestOption<LookupRequest, StaffLookupResponse>) {
        this.networkService.request({
            trCode: "STM10000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: StaffLookupResponse = {
                totalCount: response.totalCount ?? 0,
                staffList: (response.staffList ?? []) as StaffLookup[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
