import NetworkServices, { RequestOptions } from "../network-servies";
import OfflineModeUpdate from "@/utilities/offline-mode-update";

export default class AutAPI {
	private networkService: NetworkServices;
	private static instance: AutAPI;
	private networkStatusUpdate: OfflineModeUpdate;
	private networkStatus: boolean = false;

	private constructor() {
		this.networkService = new NetworkServices();
		this.networkStatusUpdate = new OfflineModeUpdate();
		this.networkStatusUpdate.subscribe({
			onUpdate: (status) => {
				this.networkStatus = status;
			}
		});
	}

	static getInstance(): AutAPI {
		if (!AutAPI.instance) {
			AutAPI.instance = new AutAPI();
		}
		return AutAPI.instance;
	}

	/** AUT10000 - Login */
	login(options: RequestOptions) {
		this.networkService.request("AUT10000", {
			body: options.body,
			enableLoading: options.enableLoading,
			removeCacheKeys: options.removeCacheKeys,
			saveCache: options.saveCache,
			isHaptic: true,
			onSuccess: (response) => {
				options.onSuccess(response);
			},
			onFailed: (error) => {
				options.onFailed && options.onFailed(error);
			}
		});
	}

	/** AUT12000 - Refresh access token (public: refreshToken is the credential) */
	refresh(options: RequestOptions) {
		this.networkService.request("AUT12000", {
			body: options.body,
			enableLoading: options.enableLoading,
			removeCacheKeys: options.removeCacheKeys,
			saveCache: options.saveCache,
			onSuccess: (response) => {
				options.onSuccess(response);
			},
			onFailed: (error) => {
				options.onFailed && options.onFailed(error);
			}
		});
	}

	/** AUT10000 - Login with Google (TODO: confirm trCode with backend) */
	loginWithGoogle(options: RequestOptions) {
		this.networkService.request("AUT10001", {
			body: options.body,
			enableLoading: options.enableLoading,
			removeCacheKeys: options.removeCacheKeys,
			saveCache: options.saveCache,
			isHaptic: true,
			onSuccess: (response) => {
				options.onSuccess(response);
			},
			onFailed: (error) => {
				options.onFailed && options.onFailed(error);
			}
		});
	}
}
