import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";

export interface UploadStoreLogoRequest {
    imageBase64: string;
    contentType?: string;
}

/** ADM31000I02 — upload the company logo to private R2; returns a presigned url. */
export default class UploadStoreLogo implements IRequest<UploadStoreLogoRequest, { logoUrl?: string }> {
    private readonly networkService: HttpNetworkService;
    private static instance: UploadStoreLogo;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): UploadStoreLogo {
        if (!this.instance) {
            this.instance = new UploadStoreLogo();
        }
        return this.instance;
    }

    public request(option: RequestOption<UploadStoreLogoRequest, { logoUrl?: string }>) {
        this.networkService.request({
            trCode: "ADM31000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as { logoUrl?: string });
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
