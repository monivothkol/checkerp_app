import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { AUT10000I01Request, AUT10000I01Response } from "@/models/COMMON/AUT10000";

/** AUT10000I01 — sign in. */
export default class Login implements IRequest<AUT10000I01Request, AUT10000I01Response> {
	private static instance: Login;
	private readonly networkService = HttpNetworkService.getInstance();

	public static getInstance(): Login {
		if (!this.instance) this.instance = new Login();
		return this.instance;
	}

	public request(option: RequestOption<AUT10000I01Request, AUT10000I01Response>) {
		this.networkService.request({ trCode: "AUT10000I01", reqBody: option.dataBody, stateProps: option.stateProps, loadingBtn: option.loadingBtn, enableLoading: option.enableLoading, headers: option.headers })
			.then((r) => option.listener.onSuccess(r as AUT10000I01Response))
			.catch((e) => option.listener.onFail?.(e));
	}
}
