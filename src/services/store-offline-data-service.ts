import { CommonStandardCodeStatement, FundPurposeStatement, IndustryCategoryStatement, LoanProductStatement, TableContactHistoryStatement, TableCustomerStatement, TableDashboardStatement, TableDebtorStatement, TableLoanApplicationStatement, TablePaymentPlanReportStatement, TableVisitedReportStatement } from "@/enum/table-statement";
import { CIF1000000Item } from "@/interfaces/CIF/CIF1000000";
import { BizCheckMobileDatabase, BizCheckMobileDateTime, BizCheckMobileLogger } from "@/shared/bizcheckmobile";
export default class StoreOfflineDataService {
	// dashboard store Offline Data
	createTableDashboard() {
		BizCheckMobileDatabase.executeSql({
			sql: TableDashboardStatement.CREATE_TABLE_DASHBOARD,
			onSuccess: () => {
				BizCheckMobileLogger.info("Created Table Dashboard");
			},
			onError: (error) => {
				BizCheckMobileLogger.error("Error Create Table Dashboard", error);
			}
		});
	}

	insertOrUpdateDashboard(options: { category: string, value: any }) {
		BizCheckMobileDatabase.executeSql({
			sql: TableDashboardStatement.INSERT_UPDATE_DASHBOARD,
			params: [options.category, JSON.stringify(options.value)],
			onSuccess: (result) => {
				//
			},
			onError: (error) => {
				//
			}
		});
	}

	inquiryDashboard(option: { category: string, callback: (result: any) => void }) {
		BizCheckMobileDatabase.executeSelect({
			sql: TableDashboardStatement.SELECT_DASHBOARD_BY_ID,
			params: [option.category],
			onSuccess: (result) => {
				if (result.length > 0) {
					option.callback(JSON.parse(result[0].value));
				} else {
					option.callback({});
				}
			},
			onError: (error) => {
				option.callback({});
			}
		});
	}

	// payment plan report
	createTablePaymentPlanReport() {
		BizCheckMobileDatabase.executeSql({
			sql: TablePaymentPlanReportStatement.CREATE_TABLE_PAYMENT_PLAN_REPORT,
			onSuccess: () => {
				BizCheckMobileLogger.info("created table PaymentPlan Report List");
			},
			onError: (error) => {
				BizCheckMobileLogger.error("created table Payment Plan Report List", error);
			}
		});
	}

	insertPaymentPlanReportList(options: { category: string, value: any }) {

		options.value = this.mappingListField(options);

		BizCheckMobileDatabase.executeSql({
			sql: TablePaymentPlanReportStatement.INSERT_PAYMENT_PLAN_REPORT,
			params: [options.category, JSON.stringify(options.value)],
			onSuccess: (result) => {
				BizCheckMobileLogger.info("insertPaymentPlanReportList", result);
			},
			onError: (error) => {
				BizCheckMobileLogger.error("insertPaymentPlanReportList", error);
			}
		});
	}

	inquiryPaymentPlanReportList(options: { callback: (result: any) => void, category: string }) {
		BizCheckMobileDatabase.executeSelect({
			sql: TablePaymentPlanReportStatement.SELECT_PAYMENT_PLAN_REPORT,
			params: [options.category],
			onSuccess: (result) => {
				if (result.length > 0) {
					options.callback(JSON.parse(result[0].value));
				} else {
					options.callback({} as any);
				}
			},
			onError: (error) => {
				BizCheckMobileLogger.error("inquiryPaymentPlanReportList", error);
				options.callback({ error: error });
			}
		});
	}

	// debtor
	createTableDebtorList() {
		BizCheckMobileDatabase.executeSql({
			sql: TableDebtorStatement.CREATE_TABLE_DEBTOR,
			onSuccess: () => {
				BizCheckMobileLogger.info("createTableDebtorList Success");
			},
			onError: (error) => {
				BizCheckMobileLogger.error("createTableDebtorList Error", error);
			}
		});
	}

	insertDebtor(options: { category: string, value: any }) {

		options.value = this.mappingListField(options);

		BizCheckMobileDatabase.executeSql({
			sql: TableDebtorStatement.INSERT_DEBTOR,
			params: [options.category, JSON.stringify(options.value)],
			onSuccess: () => {
				BizCheckMobileLogger.info("insertDebtor Success");
			},
			onError: (error) => {
				BizCheckMobileLogger.error("insertDebtor Error ", error);
			}
		});
	}

	inquiryDebtor(options: { callback: (result: any) => void, category: string }) {
		BizCheckMobileDatabase.executeSelect({
			sql: TableDebtorStatement.SELECT_DEBTOR_ALL,
			params: [options.category],
			onSuccess: (result) => {
				BizCheckMobileLogger.info("inquiryDebtor=====>", result);
				if (result.length > 0) {
					options.callback(JSON.parse(result[0].value));
				} else {
					options.callback({} as any);
				}
			},
			onError: (error) => {
				BizCheckMobileLogger.error("inquiryDebtor", error);
			}
		});
	}

	// visited report
	createTableVisitedReport() {
		BizCheckMobileDatabase.executeSql({
			sql: TableVisitedReportStatement.CREATE_TABLE_VISITED_REPORT,
			onSuccess: (result) => {
				BizCheckMobileLogger.info("createTableVisitedReport", result);
			},
			onError: (error) => {
				BizCheckMobileLogger.error("createTableVisitedReport", error);
			}
		});
	}

	insertVisitedReport(options: { category: string, value: any }) {

		options.value = this.mappingListField(options);

		BizCheckMobileDatabase.executeSql({
			sql: TableVisitedReportStatement.INSERT_VISITED_REPORT,
			params: [options.category, JSON.stringify(options.value)],
			onSuccess: (result) => {
				BizCheckMobileLogger.info("insertVisitedReport", result);
			},
			onError: (error) => {
				BizCheckMobileLogger.error(" insertVisitedReport", error);
			}
		});
	}

	inquiryVisitedReport(options: { callback: (result: any) => void, category: string }) {
		BizCheckMobileDatabase.executeSelect({
			sql: TableVisitedReportStatement.SELECT_VISITED_REPORT,
			params: [options.category],
			onSuccess: (result) => {
				if (result.length > 0) {
					options.callback(JSON.parse(result[0].value));
				} else {
					options.callback({} as any);
				}
			},
			onError: (error) => {
				BizCheckMobileLogger.error("executeSelect a error inquiryVisitedReport", error);
				options.callback({ error: error });
			}
		});
	}

	// contact history
	createTableContactHistory() {
		BizCheckMobileDatabase.executeSql({
			sql: TableContactHistoryStatement.CREATE_TABLE_CONTACT_HISTORY,
			onSuccess: (result) => {
				BizCheckMobileLogger.info("createTableContactHistory", result);
			},
			onError: (error) => {
				BizCheckMobileLogger.error("createTableContactHistory", error);
			}
		});
	}

	insertContactHistory(options: { category: string, value: any }) {

		options.value = this.mappingListField(options);

		BizCheckMobileDatabase.executeSql({
			sql: TableContactHistoryStatement.INSERT_CONTACT_HISTORY,
			params: [options.category, JSON.stringify(options.value)],
			onSuccess: (result) => {
				BizCheckMobileLogger.info("insertContactHistory", result);
			},
			onError: (error) => {
				BizCheckMobileLogger.error("insertContactHistory", error);
			}
		});
	}

	inquiryContactHistory(options: { callback: (result: any) => void, category: string }) {
		BizCheckMobileDatabase.executeSelect({
			sql: TableContactHistoryStatement.SELECT_CONTACT_HISTORY,
			params: [options.category],
			onSuccess: (result) => {
				if (result && result.length > 0) {
					options.callback(JSON.parse(result[0].value));
				} else {
					options.callback({} as any);
				}
			},
			onError: (error) => {
				BizCheckMobileLogger.error("error inquiryContactHistory", error);
				options.callback({ error: error });
			}
		});
	}

	createTableCustomer() {
		BizCheckMobileDatabase.executeSql({
			sql: TableCustomerStatement.CREATE_TABLE_CUSTOMER,
			onSuccess: (result) => {
				BizCheckMobileLogger.info("createTableCustomer", result);
			},
			onError: (error) => {
				BizCheckMobileLogger.error("createTableCCustomer", error);
			}
		});

	}

	insertCustomer(options: { value: any, category: string }) {
		options.value = this.mappingListField(options);
		BizCheckMobileDatabase.executeSql({
			sql: TableCustomerStatement.INSERT_CUSTOMER,
			params: [options.category, JSON.stringify(options.value)],
			onSuccess: (result) => {
				BizCheckMobileLogger.info("insertCustomer", result);
			},
			onError: (error) => {
				BizCheckMobileLogger.error("insertCustomer", error);
			}
		});
	}

	inquiryCustomer(options: { callback: (result: any) => void, category: string }) {
		const SQL_SELECT_FAILED_TRANSACTION = "SELECT * FROM failed_transaction WHERE transactionCategory IN (?,?) AND status IN (?,?,?)";
		let offlineData: any[] = [];
		BizCheckMobileDatabase.executeSelect({
			sql: SQL_SELECT_FAILED_TRANSACTION,
			params: ["CID", "CIC", "00", "09", "02"],
			onSuccess: (result) => {
				BizCheckMobileLogger.info("inquiryCustomer table failed transaction result => ", result);
				if (result && result.length > 0) {
					result.forEach((item: any) => {
						const data = JSON.parse(item.reqBody);
						const customerType = item.transactionCategory === "CID" ? "IC" : "CO";
						offlineData.push(this.customerMapList(data.body, item.KeyID, customerType, item.id));
					});
				}
				BizCheckMobileLogger.info("inquiryCustomer result => ", offlineData);
			},
			onError: (error) => {
				BizCheckMobileLogger.error("executeSql appendCustomerList error => ", error, offlineData);
			}
		});

		BizCheckMobileDatabase.executeSelect({
			sql: TableCustomerStatement.SELECT_CUSTOMER,
			params: [options.category],
			onSuccess: (result) => {
				BizCheckMobileLogger.info("inquiryCustomer=====>", result, offlineData);
				if (result && result.length > 0) {
					let list = JSON.parse(result[0].value);
					if (offlineData.length > 0) {
						offlineData.sort((a: any, b: any) => Number(b.id) - Number(a.id));
						list.list = [...offlineData, ...list.list];
					}
					options.callback(list);
				} else {
					options.callback({} as any);
				}
			},
			onError: (error) => {
				BizCheckMobileLogger.error("error inquiryCCustomer", error);
				options.callback({ error: error });
			}
		});
	}

	createTableLoanApplication() {
		BizCheckMobileDatabase.executeSql({
			sql: TableLoanApplicationStatement.CREATE_TABLE_LOAN_APPLICATION,
			onSuccess: (result) => {
				BizCheckMobileLogger.info("createTableLoanApplication", result);
			},
			onError: (error) => {
				BizCheckMobileLogger.error("createTableLoanApplication", error);
			}
		});
	}

	insertLoanApplication(options: { value: any, category: string }) {

		options.value = this.mappingListField(options);

		BizCheckMobileDatabase.executeSql({
			sql: TableLoanApplicationStatement.INSERT_LOAN_APPLICATION,
			params: [options.category, JSON.stringify(options.value)],
			onSuccess: (result) => {
				BizCheckMobileLogger.info("insertLoanApplication", result);
			},
			onError: (error) => {
				BizCheckMobileLogger.error("insertLoanApplication", error);
			}
		});
	}

	inquiryLoanApplication(options: { callback: (result: any) => void, category: string }) {
		BizCheckMobileDatabase.executeSelect({
			sql: TableLoanApplicationStatement.SELECT_LOAN_APPLICATION,
			params: [options.category],
			onSuccess: (result) => {
				if (result && result.length > 0) {
					options.callback(JSON.parse(result[0].value));
				} else {
					options.callback({} as any);
				}
			},
			onError: (error) => {
				BizCheckMobileLogger.error("error inquiryLoanApplication", error);
				options.callback({ error: error });
			}
		});
	}

	private mappingListField(options: any) {

		BizCheckMobileLogger.info("Data before insert => ", options.value);

		let resultObject = {};
		let countField = "";
		let listField = "";

		Object.keys(options.value).forEach(key => {
			const value = options.value[key];

			if (value !== undefined && typeof value === "string" && value.toLowerCase().includes("count")) {
				countField = key;
			}

			if (value !== undefined && Array.isArray(value)) {
				// Assuming the "list" field is an array
				listField = key;
			}
		});

		// Only set if both fields exist
		if (countField && listField) {
			options.value[countField] = options.value[listField].length;
		}

		BizCheckMobileLogger.info("Data after insert => ", options.value);

		return { ...resultObject, ...options.value };
	}

	createTableCommonStandardCode() {
		BizCheckMobileDatabase.executeSql({
			sql: CommonStandardCodeStatement.CREATE_TABLE_COMMON_STANDARD_CODE,
			onSuccess: () => {
				BizCheckMobileLogger.info("Created Table Dashboard");
			},
			onError: (error) => {
				BizCheckMobileLogger.error("Error Create Table Dashboard", error);
			}
		});

		const SQL_TABLE_ALTER_COMMON_STANDARD_CODE = ["ALTER TABLE common_standard_code ADD COLUMN type VARCHAR(255)", "ALTER TABLE common_standard_code ADD COLUMN category VARCHAR(255)"];
		SQL_TABLE_ALTER_COMMON_STANDARD_CODE.forEach(sql => {
			BizCheckMobileDatabase.executeSql({
				sql: sql,
				onSuccess: (result) => {
					BizCheckMobileLogger.info("alterTableCommonStandardCode", result,);
				},
				onError: (error) => {
					BizCheckMobileLogger.error("errr alterTableCommonStandardCode", error, sql);
				}
			});
		});
	}

	insertCommonStandardCode(option: { value: any, category?: string, type?: string }) {
		BizCheckMobileDatabase.executeSql({
			sql: CommonStandardCodeStatement.INSERT_COMMON_STANDARD_CODE,
			params: [JSON.stringify(option.value), option.category || "LEVEL_1", option.type || ""],
			onSuccess: () => {
				BizCheckMobileLogger.info("inserted common code");
			},
			onError: (error) => {
				BizCheckMobileLogger.error("Error Create Table Dashboard", error);
			}
		});
	}

	updateCommonStandardCode(option: { value: any }) {
		BizCheckMobileDatabase.executeSql({
			sql: CommonStandardCodeStatement.UPDATE_COMMON_STANDARD_CODE,
			params: [JSON.stringify(option.value), 1],
			onSuccess: () => {
				BizCheckMobileLogger.info("updated common code");
			},
			onError: (error) => {
				BizCheckMobileLogger.error("error Select count common code", error);
			}
		});
	}
	deleteCommonStandardCode(option: { value: any, category?: string, type?: string }) {
		BizCheckMobileDatabase.executeSql({
			sql: CommonStandardCodeStatement.DELETE_COMMON_STANDARD_CODE,
			params: [option.category || "LEVEL_1", option.type || ""],
			onSuccess: () => {
				BizCheckMobileLogger.info("deleted common code");
				this.insertCommonStandardCode({ value: option.value, category: option.category || "LEVEL_1", type: option.type || "" });
			},
			onError: (error) => {
				BizCheckMobileLogger.error("Error delete common code", error);
			}
		});
	}

	selectCountCommonStandardCode(option: { callback: (result: any) => void, category?: string, type?: string }) {
		BizCheckMobileDatabase.executeSelect({
			sql: CommonStandardCodeStatement.SELECT_COUNT_COMMON_STANDARD_CODE,
			params: [option.category || "LEVEL_1", option.type || ""],
			onSuccess: (result) => {
				BizCheckMobileLogger.info("select count common code", result);
				if (result && result.length > 0) {
					option.callback(result[0].totalCount);
				}
			},
			onError: (error) => {
				BizCheckMobileLogger.error("Error select count common code", error);
			}
		});
	}

	inquiresCommonStandardCode(option: { callback: (result: any) => void, category?: string, type?: string }) {
		BizCheckMobileDatabase.executeSelect({
			sql: CommonStandardCodeStatement.SELECT_COMMON_STANDARD_CODE,
			params: [option.category || "LEVEL_1", option.type || ""],
			onSuccess: (result) => {
				BizCheckMobileLogger.info("select common code", result);
				if (result && result.length > 0) {
					option.callback(JSON.parse(result[0].value));
				}
			},
			onError: (error) => {
				BizCheckMobileLogger.error("Error select common code", error);
			}
		});
	}

	deleteTableCommonStandardCode() {
		BizCheckMobileDatabase.executeSql({
			sql: CommonStandardCodeStatement.DELETE_TABLE_COMMON_STANDARD_CODE,
			onSuccess: () => {
				BizCheckMobileLogger.info("Deleted Table Common Standard Code");
			},
			onError: (error) => {
				BizCheckMobileLogger.error("Error Delete Table Common Standard Code", error);
			}
		});
	}

	createTableLoanProduct() {
		BizCheckMobileDatabase.executeSql({
			sql: LoanProductStatement.CREATE_TABLE_LOAN_PRODUCT,
			onSuccess: () => {
				// BizCheckMobileLogger.info("Created Table Dashboard");
			},
			onError: (error) => {
				// BizCheckMobileLogger.error("Error Create Table Dashboard", error);
			}
		});
	}

	insertLoanProduct(option: { value: any }) {
		BizCheckMobileDatabase.executeSql({
			sql: LoanProductStatement.INSERT_LOAN_PRODUCT,
			params: [JSON.stringify(option.value)],
			onSuccess: () => {
				BizCheckMobileLogger.info("inserted product");
			},
			onError: (error) => {
				BizCheckMobileLogger.error("Error insert product", error);
			}
		});
	}

	updateLoanProduct(option: { value: any }) {
		BizCheckMobileDatabase.executeSql({
			sql: LoanProductStatement.UPDATE_LOAN_PRODUCT,
			params: [JSON.stringify(option.value), 1],
			onSuccess: () => {
				BizCheckMobileLogger.info("updated product");
			},
			onError: (error) => {
				BizCheckMobileLogger.error("error loan product", error);
			}
		});
	}

	selectCountLoanProduct(option: { callback: (result: any) => void }) {
		BizCheckMobileDatabase.executeSelect({
			sql: LoanProductStatement.SELECT_COUNT_LOAN_PRODUCT,
			params: [],
			onSuccess: (result) => {
				BizCheckMobileLogger.info("select count product", result);
				if (result && result.length > 0) {
					option.callback(result[0].totalCount);
				}
			},
			onError: (error) => {
				BizCheckMobileLogger.error("Error select count product", error);
			}
		});
	}

	inquiresLoanProduct(option: { callback: (result: any) => void }) {
		BizCheckMobileDatabase.executeSelect({
			sql: LoanProductStatement.SELECT_LOAN_PRODUCT,
			params: [],
			onSuccess: (result) => {
				BizCheckMobileLogger.info("select loan product", result);
				if (result && result.length > 0) {
					option.callback(JSON.parse(result[0].value));
				}
			},
			onError: (error) => {
				BizCheckMobileLogger.error("Error select loan product", error);
			}
		});
	}

	createTableFundPurpose() {
		BizCheckMobileDatabase.executeSql({
			sql: FundPurposeStatement.CREATE_TABLE_FUND_PURPOSE,
			onSuccess: () => {
				// BizCheckMobileLogger.info("Created Table Dashboard");
			},
			onError: (error) => {
				BizCheckMobileLogger.error("Error Create Table fund purpose", error);
			}
		});
	}

	insertFundPurpose(option: { value: any }) {
		BizCheckMobileDatabase.executeSql({
			sql: FundPurposeStatement.INSERT_FUND_PURPOSE,
			params: [JSON.stringify(option.value)],
			onSuccess: () => {
				// BizCheckMobileLogger.info("inserted product");
			},
			onError: (error) => {
				BizCheckMobileLogger.error("Error insert fund purpose", error);
			}
		});
	}

	updateFundPurpose(option: { value: any }) {
		BizCheckMobileDatabase.executeSql({
			sql: FundPurposeStatement.UPDATE_FUND_PURPOSE,
			params: [JSON.stringify(option.value), 1],
			onSuccess: () => {
				// BizCheckMobileLogger.info("updated product");
			},
			onError: (error) => {
				BizCheckMobileLogger.error("error update fund purpose", error);
			}
		});
	}

	selectCountFundPurpose(option: { callback: (result: any) => void }) {
		BizCheckMobileDatabase.executeSelect({
			sql: FundPurposeStatement.SELECT_COUNT_FUND_PURPOSE,
			params: [],
			onSuccess: (result) => {
				BizCheckMobileLogger.info("select count fund purpose", result);
				if (result && result.length > 0) {
					option.callback(result[0].totalCount);
				}
			},
			onError: (error) => {
				BizCheckMobileLogger.error("Error select count fund purpose", error);
			}
		});
	}

	inquiresFundPurpose(option: { callback: (result: any) => void }) {
		BizCheckMobileDatabase.executeSelect({
			sql: FundPurposeStatement.SELECT_FUND_PURPOSE,
			params: [],
			onSuccess: (result) => {
				BizCheckMobileLogger.info("select fund purpose", result);
				if (result && result.length > 0) {
					option.callback(JSON.parse(result[0].value));
				}
			},
			onError: (error) => {
				BizCheckMobileLogger.error("Error select fund purpose", error);
			}
		});
	}

	createTableIndustryCategory() {
		BizCheckMobileDatabase.executeSql({
			sql: IndustryCategoryStatement.CREATE_TABLE_INDUSTRY_CATEGORY,
			onSuccess: () => {
				// BizCheckMobileLogger.info("Created Table Dashboard");
			},
			onError: (error) => {
				BizCheckMobileLogger.error("Error Create Table fund purpose", error);
			}
		});
	}

	insertIndustryCategory(option: { value: any }) {
		BizCheckMobileDatabase.executeSql({
			sql: IndustryCategoryStatement.INSERT_INDUSTRY_CATEGORY,
			params: [JSON.stringify(option.value)],
			onSuccess: () => {
				// BizCheckMobileLogger.info("inserted product");
			},
			onError: (error) => {
				BizCheckMobileLogger.error("Error insert IndustryCategory", error);
			}
		});
	}

	updateIndustryCategory(option: { value: any }) {
		BizCheckMobileDatabase.executeSql({
			sql: IndustryCategoryStatement.UPDATE_INDUSTRY_CATEGORY,
			params: [JSON.stringify(option.value), 1],
			onSuccess: () => {
				// BizCheckMobileLogger.info("updated product");
			},
			onError: (error) => {
				BizCheckMobileLogger.error("error update IndustryCategory", error);
			}
		});
	}

	selectCountIndustryCategory(option: { callback: (result: any) => void }) {
		BizCheckMobileDatabase.executeSelect({
			sql: IndustryCategoryStatement.SELECT_COUNT_INDUSTRY_CATEGORY,
			params: [],
			onSuccess: (result) => {
				BizCheckMobileLogger.info("select count IndustryCategory", result);
				if (result && result.length > 0) {
					option.callback(result[0].totalCount);
				}
			},
			onError: (error) => {
				BizCheckMobileLogger.error("Error select count IndustryCategory", error);
			}
		});
	}

	inquiresIndustryCategory(option: { callback: (result: any) => void }) {
		BizCheckMobileDatabase.executeSelect({
			sql: IndustryCategoryStatement.SELECT_INDUSTRY_CATEGORY,
			params: [],
			onSuccess: (result) => {
				BizCheckMobileLogger.info("select IndustryCategory", result);
				if (result && result.length > 0) {
					option.callback(JSON.parse(result[0].value));
				}
			},
			onError: (error) => {
				BizCheckMobileLogger.error("Error select IndustryCategory", error);
			}
		});
	}

	customerMapList(list: any, customerNo: string, customerType: string, id: string) {
		if (customerType === "IC") {
			const listMapIC = {
				id: id,
				consultationCount: 0,
				customerNo: customerNo,
				customerName: list.customerLastName + " " + list.customerFirstName,
				gender: list.gender,
				customerType: customerType,
				identifyType: list.identifyList[0].identifyType,
				identifyNumber: list.identifyList[0].identifyNumber,
				birthDate: list.realBirthDate,
				phoneNumber: list.contactList[0].phoneNo,
				occupationDescription: "",
				addressDetail: "",
				createdDate: BizCheckMobileDateTime.getCurrentDate()
			};
			return listMapIC;
		} else {
			const listMapCO = {
				id: id,
				consultationCount: 0,
				customerNo: customerNo,
				customerName: list.customerName,
				gender: list.gender,
				customerType: customerType,
				identifyType: list.identifyList[0].identifyType,
				identifyNumber: list.identifyList[0].identifyNumber,
				birthDate: list.establishedDate,
				phoneNumber: list.contactList[0].phoneNo,
				occupationDescription: "",
				addressDetail: "",
				createdDate: BizCheckMobileDateTime.getCurrentDate()
			};
			return listMapCO;
		}
	}

	registerTable() {
		this.createTableDashboard();
		this.createTableDebtorList();
		this.createTablePaymentPlanReport();
		this.createTableVisitedReport();
		this.createTableContactHistory();
		this.createTableCustomer();
		this.createTableLoanApplication();
		this.createTableCommonStandardCode();
		this.createTableLoanProduct();
		this.createTableFundPurpose();
		this.createTableIndustryCategory();
	}

}
