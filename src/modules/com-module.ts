import { COM1000000Item, COM1000000Request, COM1000000Response } from "@/interfaces/COM/COM1000000";
import { RequestOptions } from "@/services/network-servies";
import ComAPI from "@/services/api/com-api";
import { COM3000000Request, COM3000000Response } from "@/interfaces/COM/COM3000000";
import { COM2100000Request, COM2100000Response } from "@/interfaces/COM/COM2100000";
import { USC01001I02Item, USC01001I02Request, USC01001I02Response } from "@/interfaces/COM/USC01001I02";
import { COM4000000Item, COM4000000Response, COM4000000Request } from "@/interfaces/COM/COM4000000";
import { COM110000Item, COM110000Request, COM110000Response } from "@/interfaces/COM/COM110000";
import { COM5000000Item, COM5000000Request, COM5000000Response } from "@/interfaces/COM/COM5000000";
import { UAC01001I91Item, UAC01001I91Request, UAC01001I91Response } from "@/interfaces/COM/UAC01001I91";
import StoreOfflineDataService from "@/services/store-offline-data-service";
import OfflineModeUpdate from "@/utilities/offline-mode-update";
import { LSB01001I20ConfigCrrList, LSB01001I20ConfigResultMapList, LSB01001I20Request, LSB01001I20Response } from "@/interfaces/COM/LSB01001I20";
import { PPM02001I94ProductRepaymentsModeList, PPM02001I94Request, PPM02001I94Response } from "@/interfaces/COM/PPM02001I94";
import { BizCheckMobileDevice } from "@/shared/bizcheckmobile";
export default class ComModule {
	private static instance: ComModule;
	private storeOfflineDataService: StoreOfflineDataService;
	private comAPI: ComAPI;
	private offlineModeUpdate: OfflineModeUpdate;
	private offlineStatus: boolean = false;
	private constructor() {
		this.comAPI = ComAPI.getInstance();
		this.storeOfflineDataService = new StoreOfflineDataService();
		this.offlineModeUpdate = new OfflineModeUpdate();
		this.offlineModeUpdate.subscribe({
			onUpdate: (status) => {
				this.offlineStatus = status;
			}
		});
	}

	static getInstance(): ComModule {
		if (!ComModule.instance) {
			ComModule.instance = new ComModule();
		}
		return ComModule.instance;
	}

	searchAddress(options: RequestOptions<COM1000000Request, COM1000000Response>) {

		const body = {
			communeCode: options.body.communeCode || "",
			districtCode: options.body.districtCode || "",
			provinceCode: options.body.provinceCode || "",
			villageCode: options.body.villageCode || "",
			searchKeyword: options.body.keyword,
			pageNumber: options.body.pageNumber,
			pageSize: options.body.pageSize,
		};


		this.comAPI.searchAddress({
			body: body,
			enableLoading: options.enableLoading,
			onSuccess: (response) => {
				const comResponse = {} as COM1000000Response;
				comResponse.totalCount = response["totalCount"] ?? 0;
				comResponse.list = (response["list"] ?? []).map((item: COM1000000Item) => ({
					provinceCode: item.provinceCode,
					provinceNameKh: item.provinceNameKh,
					provinceNameEn: item.provinceNameEn,
					districtCode: item.districtCode,
					districtNameKh: item.districtNameKh,
					districtNameEn: item.districtNameEn,
					communeCode: item.communeCode,
					communeNameKh: item.communeNameKh,
					communeNameEn: item.communeNameEn,
					villageCode: item.villageCode,
					villageNameKh: item.villageNameKh,
					villageNameEn: item.villageNameEn,
				}));
				options.onSuccess(comResponse);
			},
			onFailed: (error) => {
				options.onFailed && options.onFailed(error);
			}
		});
	}


	// eslint-disable-next-line no-unused-vars
	inquiryLoanProduct(options: { body: COM3000000Request, enableLoading: boolean, saveCache?: boolean | undefined, callback: (response: COM3000000Response) => void }) {
		if (this.offlineStatus) {
			this.storeOfflineDataService.inquiresLoanProduct({
				callback: (result) => {
					options.callback(result);
				}
			});
		} else {
			this.comAPI.inquiryLoanProduct({
				body: options.body,
				enableLoading: options.enableLoading,
				saveCache: options.saveCache || false,
				onSuccess: (response) => {
					const comResponse = {} as COM3000000Response;
					comResponse.totalCount = response["totalCount"] ?? 0;
					comResponse.list = (response["list"] ?? []).map((item: any) => ({
						managementSeqNo: item.managementSeqNo,
						productApplyStatusCode: item.productApplyStatusCode,
						productBusinessTypeCode: item.productBusinessTypeCode,
						productCode: item.productCode,
						productDetailCode: item.productDetailCode,
						productTypeCode: item.productTypeCode,
						productCurrencyCode: item.productCurrencyCode,
						refProductCode: item.refProductCode,
						productLocalName: item.productLocalName,
						productName: item.productShortName,
						productSaleStatusCode: item.productSaleStatusCode,
						productShortName: item.productShortName,
						saleEndDate: item.saleEndDate,
						saleStartDate: item.saleStartDate,
					}));
					if (options.body.productBusinessTypeCode === "" && options.body.productApplyStatusCode === "" && options.body.productCode === "" && options.body.productDetailCode === "" && options.body.productName === "") {
						this.storeOfflineDataService.selectCountLoanProduct({
							callback: (result) => {
								if (result > 0) {
									this.storeOfflineDataService.updateLoanProduct({ value: comResponse });
								} else {
									this.storeOfflineDataService.insertLoanProduct({ value: comResponse });
								}
							}
						});
					}
					options.callback(comResponse);
				},
				onFailed: () => {
					this.storeOfflineDataService.inquiresLoanProduct({
						callback: (result) => {
							options.callback(result);
						}
					});
				}
			});
		}
	}

	// eslint-disable-next-line no-unused-vars
	inquiryLoanFundPurpose(options: { body: COM2100000Request, enableLoading: boolean, saveCache?: boolean | undefined, callback: (response: COM2100000Response) => void }) {
		if (this.offlineStatus) {
			this.storeOfflineDataService.inquiresFundPurpose({
				callback: (result) => {
					options.callback(result);
				},
			});
		} else {
			this.comAPI.inquiryLoanFundPurpose({
				body: options.body,
				enableLoading: options.enableLoading,
				saveCache: options.saveCache || false,
				onSuccess: (response) => {

					if (options.body.standardCodeValue === "" && options.body.standardCodeDesc === "") {
						this.storeOfflineDataService.selectCountFundPurpose({
							callback: (count: number) => {
								if (count > 0) {
									this.storeOfflineDataService.updateFundPurpose({ value: response });
								} else {
									this.storeOfflineDataService.insertFundPurpose({ value: response });
								}
							}
						});
					}
					options.callback(response);
				},
				onFailed: () => {
					this.storeOfflineDataService.inquiresFundPurpose({
						callback: (result) => {
							options.callback(result);
						}
					});
				}
			});
		}
	}


	// eslint-disable-next-line no-unused-vars
	inquiryIndustryCategory(options: { body: USC01001I02Request, enableLoading: boolean, saveCache?: boolean | undefined, callback: (response: USC01001I02Response) => void }) {
		this.storeOfflineDataService.inquiresIndustryCategory({
			callback: (result) => {
				options.callback(result);
			}
		});
		this.comAPI.inquiryIndustryCategory({
			body: options.body,
			enableLoading: options.enableLoading,
			saveCache: options.saveCache || false,
			onSuccess: (response) => {

				const comResponse = {} as USC01001I02Response;
				comResponse.totalCount = response["totalCount"];

				comResponse.list = response["list"].map((item: USC01001I02Item) => ({
					standardIndustryCategoryCode: item["standardIndustryCategoryCode"],
					standardIndustryCategoryName: item["standardIndustryCategoryName"],
				}));

				if (options.body.standardIndustryCategoryCode === "" && options.body.standardIndustryCategoryName === "") {

					this.storeOfflineDataService.selectCountIndustryCategory({
						callback: (count: number) => {
							if (count > 0) {
								this.storeOfflineDataService.updateIndustryCategory({ value: comResponse });
							} else {
								this.storeOfflineDataService.insertIndustryCategory({ value: comResponse });
							}
						}
					});
				}

				options.callback(comResponse);
			},
			onFailed: (error) => {
				options.callback(error as any);
			}
		});
	}

	// eslint-disable-next-line no-unused-vars
	inquiryCustomerDepositAccount(options: { body: COM110000Request, enableLoading: boolean, callback: (response: COM110000Response) => void }) {
		this.comAPI.inquiryCustomerDepositAccount({
			body: options.body,
			enableLoading: options.enableLoading,
			onSuccess: (response) => {
				const comResponse = {} as COM110000Response;
				comResponse.totalCount = response["totalCount"];
				comResponse.list = response["list"].map((item: COM110000Item) => ({
					accountNo: item["accountNo"],
					transactionChannelTypeCode: item["transactionChannelTypeCode"],
					accountMgmtBranchCode: item["accountMgmtBranchCode"],
					productCode: item["productCode"],
					customerNo: item["customerNo"],
					depositAccountStatusCode: item["depositAccountStatusCode"],
					applyInterestRate: item["applyInterestRate"],
					accountBalance: item["accountBalance"],
					currentWithdrawableAccruedInterestAmount: item["currentWithdrawableAccruedInterestAmount"],
					newDate: item["newDate"],
					lastTransactionDate: item["lastTransactionDate"],
					newTellerID: item["newTellerID"],
					loanLinkYN: item["loanLinkYN"],
					newTime: item["newTime"],
					currencyCode: item["currencyCode"],
					availableBalance: item["availableBalance"],
					freezeAmount: item["freezeAmount"],
					accountDivideCode: item["accountDivideCode"],
					applyTaxRate: item["applyTaxRate"],
					depositSubjectCode: item["depositSubjectCode"],
					accountName: item["accountName"],
					productName: item["productName"],
				}));
				options.callback(comResponse);
			},
			onFailed: (error) => {
				options.callback(error as any);
			}
		});
	}

	// eslint-disable-next-line no-unused-vars
	inquiryMapCommonCode(options: { body: COM4000000Request, enableLoading: boolean, saveCache?: boolean | undefined, removeCacheKeys?: string[], callback: (response: COM4000000Response) => void }) {
		options.body.pageNumber = 1;
		options.body.pageSize = options.body.pageSize ? options.body.pageSize : 500;
		if (this.offlineStatus || (options.body.domainCode !== "" && BizCheckMobileDevice.isApp())) {
			this.storeOfflineDataService.inquiresCommonStandardCode({
				callback: (result) => {
					options.callback(result);
				}
			});
		} else {
			this.comAPI.inquiryMapCommonCode({
				body: options.body,
				enableLoading: options.enableLoading,
				saveCache: options.saveCache || false,
				removeCacheKeys: options.removeCacheKeys ?? [],
				onSuccess: (response) => {
					const comResponse = {} as COM4000000Response;
					comResponse.totalCount = response["totalCount"];
					comResponse.list = response["list"].map((item: COM4000000Item) => ({
						domainCode: item["domainCode"],
						domainCodeValue: item["domainCodeValue"],
						displayOrder: item["displayOrder"],
						languageCode: item["languageCode"],
						codeName: item["codeName"],
					}));

					comResponse.group = this.groupMapCommonCode(comResponse.list);

					this.storeOfflineDataService.selectCountCommonStandardCode({
						callback: (count: number) => {
							if (count > 0) {
								this.storeOfflineDataService.deleteCommonStandardCode({ value: comResponse });
							} else {
								this.storeOfflineDataService.insertCommonStandardCode({ value: comResponse });
							}
						}
					});

					options.callback(comResponse);
				},
				onFailed: () => {
					this.storeOfflineDataService.inquiresCommonStandardCode({
						callback: (result) => {
							options.callback(result);
						}
					});
				}
			});

		}
	}

	groupMapCommonCode(list: COM4000000Item[]): any {
		const group = list.reduce((acc: any, item: COM4000000Item) => {
			if (!acc[item.domainCode]) {
				acc[item.domainCode] = [];
			}
			acc[item.domainCode].push(item);
			return acc;
		}, {});
		return group;
	}

	// eslint-disable-next-line no-unused-vars
	inquiryMapCommonCodeStandard(options: { body: COM5000000Request, enableLoading: boolean, saveCache?: boolean | undefined, callback: (response: COM5000000Response) => void }) {

		if (this.offlineStatus) {
			this.storeOfflineDataService.inquiresCommonStandardCode({
				category: "LEVEL_2",
				type: options.body.upperDomainCodeValue || "",
				callback: (result) => {
					options.callback(result);
				}
			});

		} else {
			const body = {
				domainCode: options.body.domainCode,
				levelNo: options.body.levelNo,
				upperDomainCodeValue: options.body.upperDomainCodeValue || "",
			};
			this.comAPI.inquiryMapCommonCodeStandard({
				body: body,
				enableLoading: options.enableLoading,
				saveCache: options.saveCache || false,
				onSuccess: (response) => {
					const comResponse = {} as COM5000000Response;
					comResponse.totalCount = response["totalCount"];
					comResponse.list = response["list"].map((item: COM5000000Item) => ({
						domainCode: item["domainCode"],
						domainCodeValue: item["domainCodeValue"],
						displayOrder: item["displayOrder"],
						languageCode: item["languageCode"],
						codeName: item["codeName"],
					}));
					comResponse.group = this.groupMapCommonCode(comResponse.list);

					if (options.body.upperDomainCodeValue === "IC" || options.body.upperDomainCodeValue === "CO") {
						this.storeOfflineDataService.selectCountCommonStandardCode({
							category: "LEVEL_2",
							type: options.body.upperDomainCodeValue || "",
							callback: (count: number) => {
								if (count > 0) {
									this.storeOfflineDataService.deleteCommonStandardCode({ value: comResponse, category: "LEVEL_2", type: options.body.upperDomainCodeValue || "" });
								} else {
									this.storeOfflineDataService.insertCommonStandardCode({ value: comResponse, category: "LEVEL_2", type: options.body.upperDomainCodeValue || "" });
								}
							}
						});
					}
					options.callback(comResponse);
				},
				onFailed: (error) => {
					options.callback(error as any);
				}
			});
		}
	}

	// eslint-disable-next-line no-unused-vars
	inquiryAllUser(options: { body: UAC01001I91Request, enableLoading: boolean, saveCache?: boolean | undefined, callback: (response: UAC01001I91Response) => void }) {
		this.comAPI.inquiryAllUser({
			body: options.body,
			enableLoading: options.enableLoading,
			saveCache: options.saveCache || false,
			onSuccess: (response) => {
				const comResponse = {} as UAC01001I91Response;
				comResponse.totalCount = response["totalCount"];
				comResponse.userList = response["userList"].map((item: UAC01001I91Item) => ({
					userID: item["userID"],
					workStatusCode: item["workStatusCode"],
					userTypeCode: item["userTypeCode"],
					userFirstName: item["userFirstName"],
					userLastName: item["userLastName"],
					genderCode: item["genderCode"],
					birthDate: item["birthDate"],
					cellPhoneNoPrefix: item["cellPhoneNoPrefix"],
					officePhoneNoPrefix: item["officePhoneNoPrefix"],
					cellPhoneNo: item["cellPhoneNo"],
					officePhoneNo: item["officePhoneNo"],
					userAddress: item["userAddress"],
					branchCode: item["branchCode"],
					branchName: item["branchName"],
					sourceBranchCode: item["sourceBranchCode"],
					employeeInfoBranchCode: item["employeeInfoBranchCode"],
					jobTitleCode: item["jobTitleCode"],
					jobPositionCode: item["jobPositionCode"],
					salaryClass: item["salaryClass"],
					joiningDate: item["joiningDate"],
					retirementDate: item["retirementDate"],
					employeeSyncTypeCode: item["employeeSyncTypeCode"],
					transactionGradeCode: item["transactionGradeCode"],
					transactionActiveYN: item["transactionActiveYN"],
					userExceptionTypeCode: item["userExceptionTypeCode"],
					absenteeYN: item["absenteeYN"],
					substituteApprovalEmpNo: item["substituteApprovalEmpNo"],
					chargeResponsibleEmpNo: item["chargeResponsibleEmpNo"],
					groupwareNoticeSMSReceiveYN: item["groupwareNoticeSMSReceiveYN"],
					userTitleTypeCode: item["userTitleTypeCode"],
					emailAddress: item["emailAddress"],
					customerNo: item["customerNo"],
					userClsDate: item["userClsDate"],
					userFirstLocalName: item["userFirstLocalName"],
					userLastLocalName: item["userLastLocalName"],
					postalCode: item["postalCode"],
				}));
				options.callback(comResponse);
			},
		});
	}

	// eslint-disable-next-line no-unused-vars
	inquiryLoanApplicationCRR(options: { body: LSB01001I20Request, enableLoading: boolean, saveCache?: boolean | undefined, callback: (response: LSB01001I20Response) => void }) {

		const body = {
			collateralList: options.body.collateralList,
			customerNo: options.body.customerNo,
			downPaymentPercentage: options.body.downPaymentPercentage,
			dscrRatio: options.body.dscrRatio,
			loanApprovalApplicationNo: options.body.loanApprovalApplicationNo,
			loanCommonMasterGroupCode: options.body.loanCommonMasterGroupCode || "9999",
		};
		this.comAPI.inquiryLoanApplicationCRR({
			body: body,
			enableLoading: options.enableLoading,
			saveCache: options.saveCache || false,
			onSuccess: (response) => {
				const comResponse = {} as LSB01001I20Response;
				comResponse.configCrrList = this.groupMapCRRScore(response["configCrrList"]);
				comResponse.configResultMapList = response["configResultMapList"].map((item: LSB01001I20ConfigResultMapList) => ({
					loanCommonMasterGroupCode: item["loanCommonMasterGroupCode"],
					scoreGrade: item["scoreGrade"],
					scorePercentageStart: item["scorePercentageStart"],
					scorePercentageEnd: item["scorePercentageEnd"],
					riskLevelCode: item["riskLevelCode"],
					riskLevelName: item["riskLevelName"],
				}));
				options.callback(comResponse);
			},
			onFailed: (error) => {
				options.callback(error as any);
			},
		});
	}

	// eslint-disable-next-line no-unused-vars
	inquiryLoanProductValidation(options: { body: PPM02001I94Request, enableLoading: boolean, saveCache?: boolean | undefined, callback: (response: PPM02001I94Response) => void }) {
		this.comAPI.inquiryLoanProductValidation({
			body: options.body,
			enableLoading: options.enableLoading,
			saveCache: options.saveCache || false,
			onSuccess: (response) => {
				const comResponse = {} as PPM02001I94Response;
				comResponse.collateralAllowYn = response["collateralAllowYn"];
				comResponse.partialDisbursementAllowYn = response["partialDisbursementAllowYn"];
				comResponse.cbcLoanProductGroup = response["cbcLoanProductGroup"];
				comResponse.cbcProductType = response["cbcProductType"];
				comResponse.productRepaymentsModeList = response["productRepaymentsModeList"].map((item: PPM02001I94ProductRepaymentsModeList) => ({
					productRepaymentsMode: item["productRepaymentsMode"],
					productRepaymentsModeDesc: item["productRepaymentsModeDesc"],
				}));
				comResponse.currencyCode = response["currencyCode"];
				comResponse.loanCommonMasterGroupCode = response["loanCommonMasterGroupCode"];
				comResponse.rangeStartAmountUSD = response["rangeStartAmountUSD"];
				comResponse.rangeEndAmountUSD = response["rangeEndAmountUSD"];
				comResponse.rangeStartAmountKHR = response["rangeStartAmountKHR"];
				comResponse.rangeEndAmountKHR = response["rangeEndAmountKHR"];
				comResponse.minTermMonth = response["minTermMonth"];
				comResponse.maxTermMonth = response["maxTermMonth"];
				comResponse.minInterestRate = response["minInterestRate"];
				comResponse.maxInterestRate = response["maxInterestRate"];
				options.callback(comResponse);
			},
			onFailed: (error) => {
				options.callback(error as any);
			},
		});
	}
	groupMapCRRScore(list: LSB01001I20ConfigCrrList[]): any {
		const listData = list.filter((item: LSB01001I20ConfigCrrList) => item.contents !== "" && item.contents !== undefined);
		return listData.reduce((acc: any, item: LSB01001I20ConfigCrrList) => {
			if (!acc[item.loanCommonClassificationCode]) {
				acc[item.loanCommonClassificationCode] = [];
			}
			acc[item.loanCommonClassificationCode].push(item);
			return acc;
		}, {});
	}

}
