import { COM0000001DetailRequest, COM0000001DetailResponse, COM0000001Item, COM0000001Request, COM0000001Response } from "@/interfaces/COM/COM0000001";
import { COM1000000Item, COM1000000Request, COM1000000Response } from "@/interfaces/COM/COM1000000";
import { COM2100000Item, COM2100000Request, COM2100000Response } from "@/interfaces/COM/COM2100000";
import { COM3000000Request, COM3000000Response } from "@/interfaces/COM/COM3000000";
import NetworkServices, { RequestOptions } from "../network-servies";
import { BizCheckMobileLogger } from "@/shared/bizcheckmobile";

export default class ComAPI {
	private networkService: NetworkServices;
	private static instance: ComAPI;

	private constructor() {
		this.networkService = new NetworkServices();
	}

	static getInstance(): ComAPI {
		if (!ComAPI.instance) {
			ComAPI.instance = new ComAPI();
		}
		return ComAPI.instance;
	}

	searchAddress(options: RequestOptions) {
		this.networkService.request("USC03001I91", {
			body: options.body,
			saveCache: true,
			enableLoading: options.enableLoading,
			onSuccess: (response) => {
				options.onSuccess(response);
			},
		});
	}


	inquiryLoanProduct(options: RequestOptions) {
		this.networkService.request("PPM02001I91", {
			body: options.body,
			enableLoading: options.enableLoading,
			isMock: false,
			saveCache: true,
			onSuccess: (response) => {
				options.onSuccess(response);
			},
		});
	}

	inquiryLoanFundPurpose(options: RequestOptions<COM2100000Request, COM2100000Response>) {
		this.networkService.request("LSB01001I12", {
			body: options.body,
			enableLoading: options.enableLoading,
			isMock: false,
			saveCache: options.saveCache,
			onSuccess: (response) => {
				const comResponse = {} as COM2100000Response;
				comResponse.totalCount = response["totalCount"] ?? 0;
				comResponse.list = (response["list"] ?? []).map((item: COM2100000Item) => ({
					standardCodeValue: item.standardCodeValue,
					standardCodeDesc: item.standardCodeDesc,
				}));
				options.onSuccess(comResponse);
			},
		});
	}

	inquiryIndustryCategory(options: RequestOptions) {
		this.networkService.request("USC01001I02", {
			body: options.body,
			enableLoading: options.enableLoading,
			saveCache: options.saveCache,
			onSuccess: (response) => {
				options.onSuccess(response);
			},
			onFailed: (error) => {
				options.onFailed && options.onFailed(error);
			},
		});
	}

	inquiryCustomerDepositAccount(options: RequestOptions) {
		this.networkService.request("DAM03005I02", {
			body: options.body,
			enableLoading: options.enableLoading,
			saveCache: options.saveCache,
			onSuccess: (response) => {
				options.onSuccess(response);
			},
			onFailed: (error) => {
				options.onFailed && options.onFailed(error);
			},
		});
	}

	inquiryMapCommonCode(options: RequestOptions) {
		this.networkService.request("USC00000I01", {
			body: options.body,
			enableLoading: options.enableLoading,
			saveCache: options.saveCache,
			removeCacheKeys: options.removeCacheKeys ?? [],
			onSuccess: (response) => {
				options.onSuccess(response);
			},
			onFailed: (error) => {
				options.onFailed && options.onFailed(error);
			},
		});
	}

	inquiryMapCommonCodeStandard(options: RequestOptions) {
		this.networkService.request("USC00000I02", {
			body: options.body,
			enableLoading: options.enableLoading,
			saveCache: options.saveCache,
			onSuccess: (response) => {
				options.onSuccess(response);
			},
			onFailed: (error) => {
				options.onFailed && options.onFailed(error);
			},
		});
	}

	inquiryAllUser(options: RequestOptions) {
		BizCheckMobileLogger.info("inquiryAllUser => ", options);
		this.networkService.request("UAC01001I91", {
			body: options.body,
			enableLoading: options.enableLoading,
			saveCache: options.saveCache,
			onSuccess: (response) => {
				options.onSuccess(response);
			},
			onFailed: (error) => {
				options.onFailed && options.onFailed(error);
			},
		});
	}

	inquiryLoanApplicationCRR(options: RequestOptions) {
		this.networkService.request("LSB01001I20", {
			body: options.body,
			enableLoading: options.enableLoading,
			saveCache: options.saveCache,
			onSuccess: (response) => {
				options.onSuccess && options.onSuccess(response);
			},
			onFailed: (error) => {
				options.onFailed && options.onFailed(error);
			}
		});
	}

	inquiryLoanProductValidation(options: RequestOptions) {
		this.networkService.request("PPM02001I94", {
			body: options.body,
			enableLoading: options.enableLoading,
			saveCache: options.saveCache,
			onSuccess: (response) => {
				options.onSuccess && options.onSuccess(response);
			},
			onFailed: (error) => {
				options.onFailed && options.onFailed(error);
			}
		});
	}
}
