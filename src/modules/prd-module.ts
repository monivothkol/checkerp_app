/* eslint-disable no-unused-vars */
import { PRD10000Request, PRD10000Response } from "@/interfaces/PRD/PRD10000";
import PrdAPI from "@/services/api/prd-api";
import { RequestOptions } from "@/services/network-servies";
import { BizCheckMobileLogger } from "@/shared/bizcheckmobile";

export default class ProductModule {
	private static instance: ProductModule;
	private prdAPI: PrdAPI;

	private constructor() {
		this.prdAPI = PrdAPI.getInstance();
	}

	static getInstance(): ProductModule {
		if (!ProductModule.instance) {
			ProductModule.instance = new ProductModule();
		}
		return ProductModule.instance;
	}

	/** PRD10000 - Product List */
	fetchProductList(options: RequestOptions<PRD10000Request, PRD10000Response>) {
		this.prdAPI.fetchProductList({
			body: options.body,
			enableLoading: options.enableLoading,
			removeCacheKeys: options.removeCacheKeys ?? [],
			saveCache: options.saveCache,
			onSuccess: (response) => {
				options.onSuccess(response as PRD10000Response);
			},
			onFailed: (error) => {
				BizCheckMobileLogger.error("ProductModule.fetchProductList failed", error);
				options.onFailed && options.onFailed(error);
			}
		});
	}
}
