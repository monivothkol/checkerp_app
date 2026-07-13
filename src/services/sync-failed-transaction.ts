import { TableFailedTransactionStatement } from "@/enum/table-statement";
import { BizCheckMobileDatabase, BizCheckMobileLogger } from "@/shared/bizcheckmobile";
import SyncTrxFailedAPI from "./api/sync-api";
import DialogUtil from "@/utilities/dialog-util";

export default class SyncFailedTransaction {

	private static dataSyncFailedTransaction: any[] = [];
	private static datIndex: number = 0;
	static isSyncing: boolean = false;
	private static instance: SyncFailedTransaction;
	private sycAPI: SyncTrxFailedAPI;
	private static syncCount: any;
	private constructor() {
		this.sycAPI = SyncTrxFailedAPI.getInstance();
	}

	static getInstance(): SyncFailedTransaction {

		if (!this.instance) {
			this.instance = new SyncFailedTransaction();
		}
		return this.instance;
	}


	createTableFailedTransaction() {
		BizCheckMobileDatabase.executeSql({
			sql: TableFailedTransactionStatement.CREATE_TABLE_FAILED_TRANSACTION,
			onSuccess: () => {
				BizCheckMobileLogger.log("executeSql createTableFailedTransaction");
			},
			onError: (error) => {
				BizCheckMobileLogger.error("executeSql createTableFailedTransaction", error);
			}
		});

		const SQL_TABLE_ALTER_FAILED_TRANSACTION = "ALTER TABLE failed_transaction ADD COLUMN KeyID VARCHAR(255)";
		BizCheckMobileDatabase.executeSql({
			sql: SQL_TABLE_ALTER_FAILED_TRANSACTION,
			onSuccess: (result) => {
				BizCheckMobileLogger.info("alterTableFailedTransaction", result,);
			},
			onError: (error) => {
				BizCheckMobileLogger.error("errr alterTableFailedTransaction", error, SQL_TABLE_ALTER_FAILED_TRANSACTION);
			}
		});
	}

	insertFailedTransaction(value: string, status: string, trCode: string, userID: string, type: string, message: string, callback: (result: boolean) => void) {
		let valueObj: any = {};
		if (type === "CID" || type === "CIC") {
			valueObj = JSON.parse(value);
			if (type === "CID") {
				valueObj.KeyID = "2ICTEMP" + ((Date.now()).toString()).slice(7, 13);
			} else if (type === "CIC") {
				valueObj.KeyID = "2COTEMP" + ((Date.now()).toString()).slice(7, 13);
			}
		} else {
			if (trCode === "LSB01001A01") {
				valueObj.KeyID = JSON.parse(value).body.customerNo;
			}
			else {
				valueObj.KeyID = (Date.now()).toString();
			}
		}
		BizCheckMobileLogger.info("insertFailedTransaction valueObj => ", valueObj);
		BizCheckMobileDatabase.executeSql({
			sql: TableFailedTransactionStatement.INSERT_FAILED_TRANSACTION,
			params: [value, status, trCode, userID, type, message, valueObj.KeyID],
			onError: (error) => {
				BizCheckMobileLogger.error("executeSql insert Failed Transaction ", error);
				DialogUtil.showAlert({ header: "Offline", message: "Failed to save your data in request offline. Please try again." });
				callback(false);
			},
			onSuccess: (result) => {
				BizCheckMobileLogger.info("executeSql inserted Transaction ", result);
				DialogUtil.showAlert({
					header: "Offline", message: "You are currently offline. Your request has been saved and will be synchronized once you are back online.",
					onDidDismiss: () => {
						BizCheckMobileLogger.info("executeSql inserted Transaction success");
						callback(true);
					}
				});
			}
		});
	}

	async selectFailedTransaction(syncYN: string[], option: { callback: (result: any) => void }): Promise<any> {
		BizCheckMobileDatabase.executeSelect({
			sql: TableFailedTransactionStatement.SELECT_FAILED_TRANSACTION,
			params: syncYN,
			onError: (error) => {
				BizCheckMobileLogger.error("execute select error =========> ", error);
				option.callback({ error: error });
			},
			onSuccess: (result) => {
				BizCheckMobileLogger.info("execute select success ==========> ", result);
				if (result.length > 0) {
					option.callback(result);
				} else {
					option.callback([]);
				}
			}
		});
	}

	updateFailedTransaction(id: number, status: string, message: string, callback: () => void) {
		BizCheckMobileLogger.info("updateFailedTransaction => ", id, message, status);
		BizCheckMobileDatabase.executeSql({
			sql: TableFailedTransactionStatement.UPDATE_FAILED_TRANSACTION,
			params: [status, message, Number(id)],
			onError: (error) => {
				BizCheckMobileLogger.error("executeSql updateFailedTransaction", error);
			},
			onSuccess: (result) => {
				callback();
				BizCheckMobileLogger.info("execute Sql updated Transaction", result);
			}
		});
	}

	deleteFailedTransaction(id: number, callback: () => void) {
		BizCheckMobileDatabase.executeSql({
			sql: TableFailedTransactionStatement.DELETE_FAILED_TRANSACTION,
			params: [Number(id)],
			onError: (error) => {
				BizCheckMobileLogger.error("executeSql deleteFailedTransaction id: " + id + " error: " + error, error);
			},
			onSuccess: (result) => {
				callback();
				BizCheckMobileLogger.info("executeSql deleted Transaction id: " + id + " result: " + result, result);
			}
		});
	}

	syncFailedTransactionToServer(options: { enableLoading?: boolean, syncedCallback?: () => void }) {
		SyncFailedTransaction.datIndex = 0;

		this.selectFailedTransaction(["00", "09", "02"], {
			callback: (result) => {
				if (result.length > 0) {
					SyncFailedTransaction.isSyncing = true;
					SyncFailedTransaction.dataSyncFailedTransaction = result;
					this.syncFailedTransaction(
						result[SyncFailedTransaction.datIndex].trCode,
						JSON.parse(result[SyncFailedTransaction.datIndex].reqBody),
						result[SyncFailedTransaction.datIndex].id,
						{ syncedCallback: options.syncedCallback }
					);
				} else {
					SyncFailedTransaction.isSyncing = false;
					if (options.syncedCallback) options.syncedCallback();
				}
			}
		});
	}

	registerAutoSync(options: { intervalTime: number }) {
		SyncFailedTransaction.syncCount = setInterval(() => {
			this.selectFailedTransaction(["00", "09", "02"], {
				callback: (result) => {
					if (result.length > 0) {
						SyncFailedTransaction.isSyncing = true;
						SyncFailedTransaction.dataSyncFailedTransaction = result;
						this.syncFailedTransaction(result[SyncFailedTransaction.datIndex].trCode, JSON.parse(result[SyncFailedTransaction.datIndex].reqBody), result[SyncFailedTransaction.datIndex].id);
					} else {
						clearInterval(SyncFailedTransaction.syncCount);
					}
				}
			});
		}, options.intervalTime);
	}

	async syncFailedTransaction(trCode: string, value: any, id: number, options?: { syncedCallback?: () => void }) {
		const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

		if (trCode === "LSB01001A01") {
			await sleep(6000);
		}
		this.updateFailedTransaction(id, "02", SyncFailedTransaction.dataSyncFailedTransaction[SyncFailedTransaction.datIndex].message,
			() => {
				this.sycAPI.sync(trCode, {
					body: value.body,
					enableLoading: false,
					idOfflineData: id,
					fieldName: value.fieldName,
					filePaths: value.filePaths,
					multipartFieldName: value.multipartFieldName,
					multipartFilePaths: value.multipartFilePaths,
					targetFieldMapFileID: value.targetFieldMapFileID,
					multipart: value.multipart,
					onSuccess: (result) => {
						BizCheckMobileLogger.info("syncFailedTransaction succesLEM12001A02s", result);
						if ((trCode === "LEM12001A01" || trCode === "LEM12001A02") && result.customerNo) {
							this.selectFailedTransactionByCategory("LAN", result.customerNo, SyncFailedTransaction.dataSyncFailedTransaction[SyncFailedTransaction.datIndex].KeyID);
						}
						this.deleteFailedTransaction(id, () => {

							SyncFailedTransaction.datIndex++;
							if (SyncFailedTransaction.datIndex === SyncFailedTransaction.dataSyncFailedTransaction.length) {
								BizCheckMobileLogger.info("End of records..");
								SyncFailedTransaction.datIndex = 0;
								SyncFailedTransaction.dataSyncFailedTransaction = [];
								SyncFailedTransaction.isSyncing = false;
								if (options && options.syncedCallback) options.syncedCallback();
								return;
							}

							if (SyncFailedTransaction.datIndex < SyncFailedTransaction.dataSyncFailedTransaction.length) {
								this.syncFailedTransaction(SyncFailedTransaction.dataSyncFailedTransaction[SyncFailedTransaction.datIndex].trCode, JSON.parse(SyncFailedTransaction.dataSyncFailedTransaction[SyncFailedTransaction.datIndex].reqBody), SyncFailedTransaction.dataSyncFailedTransaction[SyncFailedTransaction.datIndex].id, options);
							}
						});

					},
					onFailed: (error) => {

						BizCheckMobileLogger.error("syncFailedTransaction failed", error);

						this.updateFailedTransaction(id, "09", error.message, () => {
							SyncFailedTransaction.datIndex++;
							if (SyncFailedTransaction.datIndex === SyncFailedTransaction.dataSyncFailedTransaction.length) {
								BizCheckMobileLogger.info("End of records in error");
								SyncFailedTransaction.datIndex = 0;
								SyncFailedTransaction.dataSyncFailedTransaction = [];
								SyncFailedTransaction.isSyncing = false;
								if (options && options.syncedCallback) options.syncedCallback();
								return;
							}
							if (SyncFailedTransaction.datIndex < SyncFailedTransaction.dataSyncFailedTransaction.length) {
								this.syncFailedTransaction(SyncFailedTransaction.dataSyncFailedTransaction[SyncFailedTransaction.datIndex].trCode, JSON.parse(SyncFailedTransaction.dataSyncFailedTransaction[SyncFailedTransaction.datIndex].reqBody), SyncFailedTransaction.dataSyncFailedTransaction[SyncFailedTransaction.datIndex].id, options);
							}
						});
					}
				});
			});
	}

	// To Customer ID for Loan Application by Category and KeyID
	selectFailedTransactionByCategory(category: string, customerNo: string, keyid?: string) {
		BizCheckMobileLogger.info("selectFailedTransactionByCategory category => ", category, customerNo);
		BizCheckMobileDatabase.executeSelect({
			sql: "SELECT * FROM failed_transaction WHERE transactionCategory = ? AND KeyID = ?",
			params: [category, keyid],
			onError: (error) => {
				BizCheckMobileLogger.error("executeSql selectFailedTransactionByCategory", error);
			},
			onSuccess: (result) => {
				BizCheckMobileLogger.info("executeSql selectFailedTransactionByCategory success", result);
				if (result && result.length > 0) {
					for (const item of result) {
						this.updateCustomerIDForLoanApplication(item.id, item.KeyID, JSON.parse(item.reqBody), customerNo, keyid);
					}
				}
			}
		});
	}

	updateCustomerIDForLoanApplication(id: number, keyid: string, value: any, customerNo: string, customerkeyid?: string) {
		const valueObj: any = value;
		BizCheckMobileLogger.info("updateCustomerIDForLoanApplication valueObj", value, keyid, customerNo);
		customerkeyid = customerkeyid || keyid;
		if (valueObj.body.customerNo === customerkeyid) {
			valueObj.body.customerNo = customerNo;
			BizCheckMobileLogger.info("updateCustomerIDForLoanApplication valueObj", valueObj);

			SyncFailedTransaction.dataSyncFailedTransaction.map((item: any) => {
				if (item.id === id) {
					item.reqBody = JSON.stringify(valueObj);
				}
			});

			let SQL = "UPDATE failed_transaction SET reqBody = ? WHERE id = ?";
			BizCheckMobileDatabase.executeSql({
				sql: SQL,
				params: [JSON.stringify(valueObj), Number(id)],
				onError: (error) => {
					BizCheckMobileLogger.error("executeSql updateCustomerIDForLoanApplication", error, valueObj);
				},
				onSuccess: (result) => {
					BizCheckMobileLogger.info("executeSql updateCustomerIDForLoanApplication success", result, valueObj);
				}
			});
		}
	}
}
