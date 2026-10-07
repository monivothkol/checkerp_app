import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { UserCreateForm, ADM11000CreateResponse } from "@/models/POS/ADM/ADM11000";

export type CreateUserPayload = UserCreateForm & { password?: string };

export default class CreateUser implements IRequest<CreateUserPayload, ADM11000CreateResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: CreateUser;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): CreateUser {
        if (!this.instance) { this.instance = new CreateUser(); }
        return this.instance;
    }
    public request(option: RequestOption<CreateUserPayload, ADM11000CreateResponse>) {
        this.networkService.request({
            trCode: "ADM11000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as ADM11000CreateResponse);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
