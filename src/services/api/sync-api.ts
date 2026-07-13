import { BizCheckMobileLogger } from "@/shared/bizcheckmobile";
import NetworkServices, { RequestOptions } from "../network-servies";
import { SharedDataStore } from "@/stores/shared-data";

export default class SyncTrxFailedAPI {
	private networkService: NetworkServices;
	private static instance: SyncTrxFailedAPI;

	private constructor() {
		this.networkService = new NetworkServices();
	}

	static getInstance(): SyncTrxFailedAPI {
		if (!this.instance) {
			this.instance = new SyncTrxFailedAPI();
		}
		return this.instance;
	}

	async sync(trCode: string, options: RequestOptions) {
		BizCheckMobileLogger.info("sync trCode => ", trCode, options);

		this.networkService.request(trCode,
			{
				body: options.body,
				enableLoading: options.enableLoading,
				endPoint: options.endPoint,
				fieldName: options.fieldName,
				filePaths: options.filePaths,
				idOfflineData: options.idOfflineData,
				multipartFieldName: options.multipartFieldName,
				multipartFilePaths: options.multipartFilePaths,
				targetFieldMapFileID: options.targetFieldMapFileID,
				multipart: options.multipart,
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
}
