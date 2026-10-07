import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { ATD10000Request, ATD10000Response, AttendanceRow } from "@/models/POS/ATD/ATD10000";

export default class RetrieveAttendanceList implements IRequest<ATD10000Request, ATD10000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveAttendanceList;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveAttendanceList {
        if (!this.instance) {
            this.instance = new RetrieveAttendanceList();
        }
        return this.instance;
    }

    public request(option: RequestOption<ATD10000Request, ATD10000Response>) {
        this.networkService.request({
            trCode: "ATD10000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: ATD10000Response = {
                totalCount: response.totalCount ?? 0,
                attendanceList: (response.attendanceList ?? []) as AttendanceRow[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
