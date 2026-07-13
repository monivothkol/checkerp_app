/* eslint-disable no-unused-vars */
import { SAL11000Request, SAL11000Response } from "@/interfaces/SAL/SAL11000";
import { SAL12000Request, SAL12000Response } from "@/interfaces/SAL/SAL12000";
import { SAL13000Request, SAL13000Response } from "@/interfaces/SAL/SAL13000";
import { SAL14000Request, SAL14000Response } from "@/interfaces/SAL/SAL14000";
import { SAL15000Request, SAL15000Response } from "@/interfaces/SAL/SAL15000";
import SalAPI from "@/services/api/sal-api";
import { RequestOptions } from "@/services/network-servies";
import OfflineModeUpdate from "@/utilities/offline-mode-update";
import { BizCheckMobileLogger } from "@/shared/bizcheckmobile";

export default class QuotationModule {
	private static instance: QuotationModule;
	private salAPI: SalAPI;
	private offlineModeUpdate: OfflineModeUpdate;
	private offlineStatus: boolean = false;

	private constructor() {
		this.salAPI = SalAPI.getInstance();
		this.offlineModeUpdate = new OfflineModeUpdate();
		this.offlineModeUpdate.subscribe({
			onUpdate: (status) => {
				this.offlineStatus = status;
			}
		});
	}

	static getInstance(): QuotationModule {
		if (!QuotationModule.instance) {
			QuotationModule.instance = new QuotationModule();
		}
		return QuotationModule.instance;
	}

	/** SAL11000 - Quotation List */
	fetchQuotationList(options: RequestOptions<SAL11000Request, SAL11000Response>) {
		this.salAPI.fetchQuotationList({
			body: options.body,
			enableLoading: options.enableLoading,
			removeCacheKeys: options.removeCacheKeys ?? [],
			saveCache: options.saveCache,
			onSuccess: (response) => {
				options.onSuccess(response as SAL11000Response);
			},
			onFailed: (error) => {
				BizCheckMobileLogger.error("QuotationModule.fetchQuotationList failed", error);
				options.onFailed && options.onFailed(error);
			}
		});
	}

	/** SAL12000 - Create Quotation */
	createQuotation(options: RequestOptions<SAL12000Request, SAL12000Response>) {
		this.salAPI.createQuotation({
			body: options.body,
			enableLoading: options.enableLoading,
			removeCacheKeys: options.removeCacheKeys ?? [],
			saveCache: options.saveCache,
			onSuccess: (response) => {
				options.onSuccess(response as SAL12000Response);
			},
			onFailed: (error) => {
				BizCheckMobileLogger.error("QuotationModule.createQuotation failed", error);
				options.onFailed && options.onFailed(error);
			}
		});
	}

	/** SAL13000 - Create Quotation Confirm */
	confirmQuotation(options: RequestOptions<SAL13000Request, SAL13000Response>) {
		this.salAPI.confirmQuotation({
			body: options.body,
			enableLoading: options.enableLoading,
			removeCacheKeys: options.removeCacheKeys ?? [],
			saveCache: options.saveCache,
			onSuccess: (response) => {
				options.onSuccess(response as SAL13000Response);
			},
			onFailed: (error) => {
				BizCheckMobileLogger.error("QuotationModule.confirmQuotation failed", error);
				options.onFailed && options.onFailed(error);
			}
		});
	}

	/** SAL14000 - Create Quotation Result */
	fetchQuotationResult(options: RequestOptions<SAL14000Request, SAL14000Response>) {
		this.salAPI.fetchQuotationResult({
			body: options.body,
			enableLoading: options.enableLoading,
			removeCacheKeys: options.removeCacheKeys ?? [],
			saveCache: options.saveCache,
			onSuccess: (response) => {
				options.onSuccess(response as SAL14000Response);
			},
			onFailed: (error) => {
				BizCheckMobileLogger.error("QuotationModule.fetchQuotationResult failed", error);
				options.onFailed && options.onFailed(error);
			}
		});
	}

	/** SAL15000 - Quotation Detail */
	fetchQuotationDetail(options: RequestOptions<SAL15000Request, SAL15000Response>) {
		this.salAPI.fetchQuotationDetail({
			body: options.body,
			enableLoading: options.enableLoading,
			removeCacheKeys: options.removeCacheKeys ?? [],
			saveCache: options.saveCache,
			onSuccess: (response) => {
				options.onSuccess(response as SAL15000Response);
			},
			onFailed: (error) => {
				BizCheckMobileLogger.error("QuotationModule.fetchQuotationDetail failed", error);
				options.onFailed && options.onFailed(error);
			}
		});
	}
}
