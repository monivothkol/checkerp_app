import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";

export interface PosContextPaymentMethod {
    paymentMethodId: string;
    methodCode: string;
    methodName: string;
    requiresChange?: boolean;
}

export interface PosContextBank {
    bankCode: string;
    bankName: string;
    shortName?: string;
}

export interface PosContextCurrency {
    primaryCurrency?: string;
    secondaryCurrency?: string;
    exchangeRate?: number | string;
}

export type POS13000Request = Record<string, never>;

export interface POS13000Response {
    paymentMethods?: PosContextPaymentMethod[];
    banks?: PosContextBank[];
    currency?: PosContextCurrency;
    allowSellWithoutStock?: boolean;
    enableProductPromotion?: boolean;
}

export default class RetrievePosContext implements IRequest<POS13000Request, POS13000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrievePosContext;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrievePosContext {
        if (!this.instance) {
            this.instance = new RetrievePosContext();
        }
        return this.instance;
    }

    public request(option: RequestOption<POS13000Request, POS13000Response>) {
        this.networkService.request({
            trCode: "POS11000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as POS13000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
