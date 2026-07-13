import { LOG000002Request, LOG000002Response, LOG000021Request, LOG000021Response } from "@/interfaces/LOG/LOG000002";
import { LOG1300000Request, LOG1300000Response, LOG1310000Request, LOG1310000Response } from "@/interfaces/LOG/LOG1300000";
import { LOGINRequest, LOGINResponse } from "@/interfaces/LOG/LOGIN";
import NetworkServices, { RequestOptions } from "../network-servies";

export default class LoginAPI {
	private networkService: NetworkServices;
	private static instance: LoginAPI;

	private constructor() {
		this.networkService = new NetworkServices();
	}

	static getInstance(): LoginAPI {
		if (!LoginAPI.instance) {
			LoginAPI.instance = new LoginAPI();
		}
		return LoginAPI.instance;
	}

	login(options: RequestOptions) {
		this.networkService.iam({
			body: options.body,
			enableLoading: options.enableLoading,
			endPoint: options.endPoint,
			onSuccess: (response) => {
				options.onSuccess(response);
			},
			onFailed: (error) => {
				if (options.onFailed) {
					options.onFailed(error);
				}
			}
		});
	}

	refresh(options: RequestOptions) {
		this.networkService.iam({
			body: options.body,
			enableLoading: options.enableLoading,
			endPoint: options.endPoint,
			onSuccess: (response) => {
				options.onSuccess(response);
			},
			onFailed: (error) => {
				if (options.onFailed) {
					options.onFailed(error);
				}
			}
		});
	}

	logout(options: RequestOptions) {
		this.networkService.iam({
			body: options.body,
			enableLoading: options.enableLoading,
			endPoint: options.endPoint,
			onSuccess: (response) => {
				options.onSuccess(response);
			},
			onFailed: (error) => {
				options.onSuccess(error);
			}
		});
	}

	otpVerify(options: RequestOptions) {
		this.networkService.iam({
			body: options.body,
			enableLoading: options.enableLoading,
			endPoint: options.endPoint,
			onSuccess: (response) => {
				options.onSuccess(response);
			},
			onFailed: (error) => {
				if (options.onFailed) {
					options.onFailed(error);
				}
			}
		});
	}

	sendOtp(options: RequestOptions) {
		this.networkService.iam({
			body: options.body,
			enableLoading: options.enableLoading,
			endPoint: options.endPoint,
			onSuccess: (response) => {
				options.onSuccess(response);
			},
			onFailed: (error) => {
				if (options.onFailed) {
					options.onFailed(error);
				}
			}
		});
	}

	authorizationCode(options: RequestOptions) {
		this.networkService.iam({
			body: options.body,
			enableLoading: options.enableLoading,
			endPoint: options.endPoint,
			onSuccess: (response) => {
				options.onSuccess(response);
			},
			onFailed: (error) => {
				if (options.onFailed) {
					options.onFailed(error);
				}
			}
		});
	}

	createOTP(options: RequestOptions) {
		this.networkService.iam({
			body: options.body,
			enableLoading: options.enableLoading,
			endPoint: options.endPoint,
			onSuccess: (response) => {
				options.onSuccess(response);
			},
			onFailed: (error) => {
				if (options.onFailed) {
					options.onFailed(error);
				}
			}
		});
	}

	registerNewPassword(options: RequestOptions) {
		this.networkService.iam({
			body: options.body,
			enableLoading: options.enableLoading,
			endPoint: options.endPoint,
			onSuccess: (response) => {
				options.onSuccess(response);
			},
			onFailed: (error) => {
				if (options.onFailed) {
					options.onFailed(error);
				}
			},
		});
	}

	registerBio(options: RequestOptions) {
		this.networkService.iam({
			body: options.body,
			endPoint: options.endPoint,
			enableLoading: options.enableLoading,
			onSuccess: (response) => {
				options.onSuccess(response);
			},
			onFailed: (error) => {
				if (options.onFailed) {
					options.onFailed(error);
				}
			}
		});
	}

	unRegisterBio(options: RequestOptions) {
		this.networkService.iam({
			body: options.body,
			endPoint: options.endPoint,
			enableLoading: options.enableLoading,
			onSuccess: (response) => {
				options.onSuccess(response);
			},
			onFailed: (error) => {
				if (options.onFailed) {
					options.onFailed(error);
				}
			}
		});
	}

	getBioKeyInfo(options: RequestOptions) {
		this.networkService.iam({
			body: options.body,
			endPoint: options.endPoint,
			enableLoading: options.enableLoading,
			onSuccess: (response) => {
				options.onSuccess(response);
			},
			onFailed: (error) => {
				if (options.onFailed) {
					options.onFailed(error);
				}
			}
		});
	}

	getVerifyBioKeyInfo(options: RequestOptions) {
		this.networkService.iam({
			body: options.body,
			endPoint: options.endPoint,
			enableLoading: options.enableLoading,
			onSuccess: (response) => {
				options.onSuccess(response);
			},
			onFailed: (error) => {
				if (options.onFailed) {
					options.onFailed(error);
				}
			}
		});
	}

	loginBio(options: RequestOptions) {
		this.networkService.iam({
			body: options.body,
			endPoint: options.endPoint,
			enableLoading: options.enableLoading,
			onSuccess: (response) => {
				options.onSuccess(response);
			},
			onFailed: (error) => {
				if (options.onFailed) {
					options.onFailed(error);
				}
			}
		});
	}

	verifyPassword(options: RequestOptions) {
		this.networkService.iam({
			body: options.body,
			endPoint: options.endPoint,
			enableLoading: options.enableLoading,
			onSuccess: (response) => {
				if (options.onSuccess) options.onSuccess(response);
			},
			onFailed: (error) => {
				if (options.onFailed) {
					options.onFailed(error);
				}
			}
		});
	}

	userPasswordPolicy(options: RequestOptions) {
		this.networkService.request("SCF13001I01", {
			body: options.body,
			enableLoading: options.enableLoading,
			onSuccess: (response) => {
				if (options.onSuccess) options.onSuccess(response);
			},
			onFailed: (error) => {
				if (options.onFailed) {
					options.onFailed(error);
				}
			}
		});
	}
}
