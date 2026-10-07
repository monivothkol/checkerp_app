import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";

export interface PMM62000Request { groupId?: string; searchKeyword?: string; }
export interface PMM62000Response { url: string; cached: boolean; fileName: string; }

export default class ExportPriceGroup implements IRequest<PMM62000Request, PMM62000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: ExportPriceGroup;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): ExportPriceGroup {
        if (!this.instance) {
            this.instance = new ExportPriceGroup();
        }
        return this.instance;
    }

    public request(option: RequestOption<PMM62000Request, PMM62000Response>) {
        this.networkService.request({
            trCode: "CUS42000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as PMM62000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
