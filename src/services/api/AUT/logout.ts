import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { AUT10000I03Request } from "@/models/COMMON/AUT10000";

/** AUT10000I03 — revoke this device's session server-side. */
export default class Logout implements IRequest<AUT10000I03Request, Record<string, never>> {
	private static instance: Logout;
	private readonly networkService = HttpNetworkService.getInstance();

	public static getInstance(): Logout {
		if (!this.instance) this.instance = new Logout();
		return this.instance;
	}

	public request(option: RequestOption<AUT10000I03Request, Record<string, never>>) {
		this.networkService.request({ trCode: "AUT10000I03", reqBody: option.dataBody, stateProps: option.stateProps, loadingBtn: option.loadingBtn, enableLoading: option.enableLoading, headers: option.headers })
			.then(() => option.listener.onSuccess({}))
			.catch((e) => option.listener.onFail?.(e));
	}
}
