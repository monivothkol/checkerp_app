import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { ATD34000DefaultRequest, ATD31000Response } from "@/models/POS/ATD/ATD30000";

/** ATD34000I02 — make a schedule a department's default. */
export default class SetScheduleDepartmentDefault implements IRequest<ATD34000DefaultRequest, ATD31000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: SetScheduleDepartmentDefault;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): SetScheduleDepartmentDefault {
        if (!this.instance) {
            this.instance = new SetScheduleDepartmentDefault();
        }
        return this.instance;
    }

    public request(option: RequestOption<ATD34000DefaultRequest, ATD31000Response>) {
        this.networkService.request({
            trCode: "ATD34000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as ATD31000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
