import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SAL27000Request, SAL27000EditData, SAL27000EditItem } from "@/models/POS/SAL/SAL27000";

export default class RetrieveSaleReturnForEdit implements IRequest<SAL27000Request, SAL27000EditData> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveSaleReturnForEdit;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveSaleReturnForEdit {
        if (!this.instance) {
            this.instance = new RetrieveSaleReturnForEdit();
        }
        return this.instance;
    }

    public request(option: RequestOption<SAL27000Request, SAL27000EditData>) {
        this.networkService.request({
            trCode: "SAL27000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: SAL27000EditData = {
                ...(response as SAL27000EditData),
                items: (response.items ?? []) as SAL27000EditItem[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
