import NetworkServices, { RequestOptions } from "../network-servies";

export default class DasAPI {
	private networkService: NetworkServices;
	private static instance: DasAPI;

	private constructor() {
		this.networkService = new NetworkServices();
	}

	static getInstance(): DasAPI {
		if (!DasAPI.instance) {
			DasAPI.instance = new DasAPI();
		}
		return DasAPI.instance;
	}

	/** DAS10000 - Dashboard */
	fetchDashboard(options: RequestOptions) {
		this.networkService.request("DAS10000", {
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
}
