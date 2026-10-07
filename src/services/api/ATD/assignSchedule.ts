import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { ATD35000Request } from "@/models/POS/ATD/ATD30000";

export default class AssignSchedule implements IRequest<ATD35000Request, Record<string, unknown>> {
    private readonly networkService: HttpNetworkService;
    private static instance: AssignSchedule;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): AssignSchedule {
        if (!this.instance) {
            this.instance = new AssignSchedule();
        }
        return this.instance;
    }

    public request(option: RequestOption<ATD35000Request, Record<string, unknown>>) {
        this.networkService.request({
            trCode: "ATD30000I02",
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
