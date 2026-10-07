import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { AdjustmentType } from "@/models/POS/PRM/PRM21000";

export interface PRM25000Request {
    manualOnly?: boolean;
}

export interface PRM25000Response {
    typeList: AdjustmentType[];
}

export default class RetrieveAdjustmentTypeList implements IRequest<PRM25000Request, PRM25000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveAdjustmentTypeList;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveAdjustmentTypeList {
        if (!this.instance) {
            this.instance = new RetrieveAdjustmentTypeList();
        }
        return this.instance;
    }

    public request(option: RequestOption<PRM25000Request, PRM25000Response>) {
        this.networkService.request({
            trCode: "PRM21000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: PRM25000Response = {
                typeList: (response.typeList ?? []) as AdjustmentType[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
