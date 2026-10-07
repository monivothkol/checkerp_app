import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { UAC02000I01Request, UAC02000I01Response } from "@/models/COMMON/UAC02000I01";

export default class RetreiveMenuListByUser implements IRequest<UAC02000I01Request, UAC02000I01Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetreiveMenuListByUser;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetreiveMenuListByUser {
        if (!this.instance) {
            this.instance = new RetreiveMenuListByUser();
        }
        return this.instance;
    }

    public request(option: RequestOption<UAC02000I01Request, UAC02000I01Response>){
        // Single backend — no multi-server priority routing.
        this.networkService.request({
            trCode: "UAC02000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
        }).then((response) => {
            option.listener?.onSuccess(response);
        }).catch((err) => {
            if (option.listener?.onFail ) {
                option?.listener?.onFail(err);
            }
        });
    }
}
