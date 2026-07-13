/* eslint-disable no-unused-vars */
import { DAS10000Request, DAS10000Response } from "@/interfaces/DAS/DAS10000";
import DasAPI from "@/services/api/das-api";
import { RequestOptions } from "@/services/network-servies";
import { BizCheckMobileLogger } from "@/shared/bizcheckmobile";

export default class DashboardModule {
	private static instance: DashboardModule;
	private dasAPI: DasAPI;

	private constructor() {
		this.dasAPI = DasAPI.getInstance();
	}

	static getInstance(): DashboardModule {
		if (!DashboardModule.instance) {
			DashboardModule.instance = new DashboardModule();
		}
		return DashboardModule.instance;
	}

	/** DAS10000 - Dashboard */
	fetchDashboard(options: RequestOptions<DAS10000Request, DAS10000Response>) {
		this.dasAPI.fetchDashboard({
			body: options.body,
			enableLoading: options.enableLoading,
			removeCacheKeys: options.removeCacheKeys ?? [],
			saveCache: options.saveCache,
			onSuccess: (response) => {
				options.onSuccess(response as DAS10000Response);
			},
			onFailed: (error) => {
				BizCheckMobileLogger.error("DashboardModule.fetchDashboard failed", error);
				options.onFailed && options.onFailed(error);
			}
		});
	}
}
