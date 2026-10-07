import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";

export interface PRD71000Request { productId: string; }
export interface PRD71000Response { restored: boolean; }

export default class RestoreProduct implements IRequest<PRD71000Request, PRD71000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RestoreProduct;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RestoreProduct {
        if (!this.instance) {
            this.instance = new RestoreProduct();
        }
        return this.instance;
    }

    public request(option: RequestOption<PRD71000Request, PRD71000Response>) {
        this.networkService.request({
            trCode: "PRD10000I03",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as PRD71000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
