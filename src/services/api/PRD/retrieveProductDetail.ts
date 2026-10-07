import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { ProductCustomFieldValue } from "@/models/POS/PRD/PRD13000";

export interface ProductDetail {
    productId: string;
    productCode: string;
    productName: string;
    barcode?: string;
    description?: string;
    unitOfMeasure?: string;
    costPrice?: number;
    sellingPrice?: number;
    minSellingPrice?: number;
    taxRate?: number;
    isTrackInventory?: boolean;
    isBatchTracked?: boolean;
    isActive?: boolean;
    categoryName?: string;
    brandName?: string;
    unitName?: string;
    wholesalePrice?: number;
    reorderPoint?: number;
    reorderQuantity?: number;
    productCodeSecondary?: string;
    productSize?: string;
    productTypeName?: string;
    skinConditionName?: string;
    usageInstructions?: string;
    customFields?: ProductCustomFieldValue[];
    attachmentFile?: string;
    slug?: string;
    createdAt?: string;
    updatedAt?: string;
    createdByName?: string;
    updatedByName?: string;
    imageUrl?: string;
    images?: string | string[];
}

export interface RetrieveProductDetailRequest {
    productCode: string;
}

export default class RetrieveProductDetail implements IRequest<RetrieveProductDetailRequest, ProductDetail> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveProductDetail;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveProductDetail {
        if (!this.instance) { this.instance = new RetrieveProductDetail(); }
        return this.instance;
    }
    public request(option: RequestOption<RetrieveProductDetailRequest, ProductDetail>) {
        this.networkService.request({
            trCode: "PRD50000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as ProductDetail);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
