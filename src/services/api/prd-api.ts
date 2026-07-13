import NetworkServices, { RequestOptions } from "../network-servies";

export default class PrdAPI {
	private networkService: NetworkServices;
	private static instance: PrdAPI;

	private constructor() {
		this.networkService = new NetworkServices();
	}

	static getInstance(): PrdAPI {
		if (!PrdAPI.instance) {
			PrdAPI.instance = new PrdAPI();
		}
		return PrdAPI.instance;
	}

	/** PRD10000 - Product List */
	fetchProductList(options: RequestOptions) {
		this.networkService.request("PRD10000", {
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
