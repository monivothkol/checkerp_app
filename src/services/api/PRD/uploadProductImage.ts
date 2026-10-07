import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";

export interface UploadProductImageRequest {
    imageBase64: string;
    contentType?: string;
}

/** PRD20000I02 — upload a product image to the public catalog bucket; returns { url }. */
export default class UploadProductImage implements IRequest<UploadProductImageRequest, { url?: string }> {
    private readonly networkService: HttpNetworkService;
    private static instance: UploadProductImage;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): UploadProductImage {
        if (!this.instance) {
            this.instance = new UploadProductImage();
        }
        return this.instance;
    }

    public request(option: RequestOption<UploadProductImageRequest, { url?: string }>) {
        this.networkService.request({
            trCode: "PRD20000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as { url?: string });
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
