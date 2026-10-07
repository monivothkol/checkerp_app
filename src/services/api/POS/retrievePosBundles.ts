import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { POS16000Response, PosBundle } from "@/models/POS/SAL/POS10000";

export default class RetrievePosBundles implements IRequest<Record<string, never>, POS16000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrievePosBundles;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrievePosBundles {
        if (!this.instance) { this.instance = new RetrievePosBundles(); }
        return this.instance;
    }
    public request(option: RequestOption<Record<string, never>, POS16000Response>) {
        this.networkService.request({
            trCode: "POS10000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess({ bundles: (response.bundles ?? []) as PosBundle[] });
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
