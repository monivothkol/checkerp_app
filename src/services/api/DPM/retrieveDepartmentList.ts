import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { DPM10000Request, DPM10000Response } from "@/models/POS/DPM/DPM10000";

/** DPM10000I01 — department list. */
export default class RetrieveDepartmentList implements IRequest<DPM10000Request, DPM10000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveDepartmentList;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveDepartmentList {
        if (!this.instance) {
            this.instance = new RetrieveDepartmentList();
        }
        return this.instance;
    }

    public request(option: RequestOption<DPM10000Request, DPM10000Response>) {
        this.networkService.request({
            trCode: "DPM10000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as DPM10000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
