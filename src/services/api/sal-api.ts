import NetworkServices, { RequestOptions } from "../network-servies";
import OfflineModeUpdate from "@/utilities/offline-mode-update";

export default class SalAPI {
	private networkService: NetworkServices;
	private static instance: SalAPI;
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

	static getInstance(): SalAPI {
		if (!SalAPI.instance) {
			SalAPI.instance = new SalAPI();
		}
		return SalAPI.instance;
	}

	/** SAL11000 - Quotation List */
	fetchQuotationList(options: RequestOptions) {
		this.networkService.request("SAL11000", {
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

	/** SAL12000 - Create Quotation */
	createQuotation(options: RequestOptions) {
		this.networkService.request("SAL12000", {
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

	/** SAL13000 - Create Quotation Confirm */
	confirmQuotation(options: RequestOptions) {
		this.networkService.request("SAL13000", {
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

	/** SAL14000 - Create Quotation Result */
	fetchQuotationResult(options: RequestOptions) {
		this.networkService.request("SAL14000", {
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

	/** SAL15000 - Quotation Detail */
	fetchQuotationDetail(options: RequestOptions) {
		this.networkService.request("SAL15000", {
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
