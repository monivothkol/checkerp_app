import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";

export interface UpdateDeliveryRequest {
    deliveryId: string;
    driverId?: string;
    deliveryAddress?: string;
    scheduledDate?: string;
    customerName?: string;
    customerPhone?: string;
    notes?: string;
}

/** SAL47000I01 — edit a PENDING delivery's dispatch fields. */
export default class UpdateDelivery implements IRequest<UpdateDeliveryRequest, { deliveryId?: string }> {
    private readonly networkService: HttpNetworkService;
    private static instance: UpdateDelivery;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): UpdateDelivery {
        if (!this.instance) {
            this.instance = new UpdateDelivery();
        }
        return this.instance;
    }

    public request(option: RequestOption<UpdateDeliveryRequest, { deliveryId?: string }>) {
        this.networkService.request({
            trCode: "SAL47000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as { deliveryId?: string });
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
