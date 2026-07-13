export const enum TableTrackingStatement {
	CREATE_TABLE_GPS_TRACKING = "CREATE TABLE IF NOT EXISTS kpl_co_tracking_detail (id INTEGER PRIMARY KEY AUTOINCREMENT, value TEXT, syncYN VARCHAR(255))",
	INSERT_GPS_TRACKING = "INSERT INTO kpl_co_tracking_detail (value, syncYN) VALUES (?, ?)",
	SELECT_GPS_TRACKING = "SELECT * FROM kpl_co_tracking_detail WHERE processing_status IN (?,?) LIMIT 100",
	UPDATE_GPS_TRACKING = "UPDATE kpl_co_tracking_detail SET processing_status = ? WHERE seq_no IN (?)",
	DELETE_GPS_TRACKING = "DELETE FROM kpl_co_tracking_detail WHERE seq_no IN (?)"
}
export const enum TableDashboardStatement {
	CREATE_TABLE_DASHBOARD = "CREATE TABLE IF NOT EXISTS dashboard (id INTEGER PRIMARY KEY AUTOINCREMENT, category VARCHAR(255) UNIQUE, value TEXT)",
	INSERT_UPDATE_DASHBOARD = "INSERT INTO dashboard (category, value) VALUES (?, ?) ON CONFLICT(category) DO UPDATE SET value = excluded.value",
	SELECT_DASHBOARD_BY_ID = "SELECT * FROM dashboard WHERE category = ?",
	SELECT_DASHBOARD = "SELECT * FROM dashboard",
}

export const enum TableFailedTransactionStatement {
	CREATE_TABLE_FAILED_TRANSACTION = "CREATE TABLE IF NOT EXISTS failed_transaction (id INTEGER PRIMARY KEY AUTOINCREMENT, reqBody TEXT, status VARCHAR(255), trCode VARCHAR(255), transactionType VARCHAR(255), transactionCategory VARCHAR(255), message VARCHAR(255))",
	INSERT_FAILED_TRANSACTION = "INSERT INTO failed_transaction (reqBody, status, trCode, transactionType,transactionCategory, message, KeyID) VALUES (?, ?, ?, ?, ?, ?, ?)",
	SELECT_FAILED_TRANSACTION = "SELECT * FROM failed_transaction WHERE status IN (?,?,?)",
	UPDATE_FAILED_TRANSACTION = "UPDATE failed_transaction SET status = ?, message = ? WHERE id = ?",
	UPDATE_FAILED_TRANSACTION_BY_ID = "UPDATE failed_transaction SET status = ?, reqBody = ?, message = ? WHERE id = ?",
	DELETE_FAILED_TRANSACTION = "DELETE FROM failed_transaction WHERE id = ?",
}

export const enum TableDebtorStatement {
	CREATE_TABLE_DEBTOR = "CREATE TABLE IF NOT EXISTS debtor (id INTEGER PRIMARY KEY AUTOINCREMENT, category VARCHAR(255) UNIQUE, value TEXT)",
	INSERT_DEBTOR = "INSERT INTO debtor (category, value) VALUES (?,?) ON CONFLICT(category) DO UPDATE SET value = excluded.value",
	SELECT_DEBTOR_ALL = "SELECT * FROM debtor WHERE category = ?",
	UPDATE_DEBTOR = "UPDATE debtor SET value = ?  WHERE category = ?",
	DELETE_DEBTOR = "DELETE FROM debtor",
	DELETE_TABLE_DEBTOR = "DROP TABLE IF EXISTS debtor",
}

export const enum TablePaymentPlanReportStatement {
	CREATE_TABLE_PAYMENT_PLAN_REPORT = "CREATE TABLE IF NOT EXISTS payment_plan_report (id INTEGER PRIMARY KEY AUTOINCREMENT, category VARCHAR(255) UNIQUE, value TEXT)",
	INSERT_PAYMENT_PLAN_REPORT = "INSERT INTO payment_plan_report (category, value) VALUES (?, ?) ON CONFLICT(category) DO UPDATE SET value = excluded.value",
	SELECT_PAYMENT_PLAN_REPORT = "SELECT * FROM payment_plan_report WHERE category = ?",
	UPDATE_PAYMENT_PLAN_REPORT = "UPDATE payment_plan_report SET value = ? WHERE category = ?",
	DELETE_PAYMENT_PLAN_REPORT = "DELETE FROM payment_plan_report",
	DELETE_TABLE_PAYMENT_PLAN_REPORT = "DROP TABLE IF EXISTS payment_plan_report",
}
export const enum TableVisitedReportStatement {
	CREATE_TABLE_VISITED_REPORT = "CREATE TABLE IF NOT EXISTS visited_report (id INTEGER PRIMARY KEY AUTOINCREMENT, category VARCHAR(255) UNIQUE, value TEXT)",
	INSERT_VISITED_REPORT = "INSERT INTO visited_report (category, value) VALUES (?, ?) ON CONFLICT(category) DO UPDATE SET value = excluded.value",
	SELECT_VISITED_REPORT = "SELECT * FROM visited_report WHERE category = ?",
	UPDATE_VISITED_REPORT = "UPDATE visited_report SET value = ? WHERE category = ?",
	DELETE_VISITED_REPORT = "DELETE FROM visited_report",
	DELETE_TABLE_VISITED_REPORT = "DROP TABLE IF EXISTS visited_report",
}

export const enum TableContactHistoryStatement {
	CREATE_TABLE_CONTACT_HISTORY = "CREATE TABLE IF NOT EXISTS contact_history (id INTEGER PRIMARY KEY AUTOINCREMENT, category VARCHAR(255) UNIQUE, value TEXT)",
	INSERT_CONTACT_HISTORY = "INSERT INTO contact_history (category, value) VALUES (?, ?) ON CONFLICT(category) DO UPDATE SET value = excluded.value",
	SELECT_CONTACT_HISTORY = "SELECT * FROM contact_history WHERE category = ?",
	UPDATE_CONTACT_HISTORY = "UPDATE contact_history SET value = ? WHERE category = ?",
	DELETE_CONTACT_HISTORY = "DELETE FROM contact_history",
	DELETE_TABLE_CONTACT_HISTORY = "DROP TABLE IF EXISTS contact_history",
}

export const enum TableCustomerStatement {
	CREATE_TABLE_CUSTOMER = "CREATE TABLE IF NOT EXISTS customer (id INTEGER PRIMARY KEY AUTOINCREMENT, category VARCHAR(255) UNIQUE, value TEXT)",
	INSERT_CUSTOMER = "INSERT INTO customer (category, value) VALUES (?, ?) ON CONFLICT(category) DO UPDATE SET value = excluded.value",
	SELECT_CUSTOMER = "SELECT * FROM customer WHERE category = ?",
	UPDATE_CUSTOMER = "UPDATE customer SET value = ? WHERE category = ?",
	DELETE_CUSTOMER = "DELETE FROM customer",
	DELETE_TABLE_CUSTOMER = "DROP TABLE IF EXISTS customer",
}

export const enum TableLoanApplicationStatement {
	CREATE_TABLE_LOAN_APPLICATION = "CREATE TABLE IF NOT EXISTS loan_application (id INTEGER PRIMARY KEY AUTOINCREMENT, category VARCHAR(255) UNIQUE, value TEXT)",
	INSERT_LOAN_APPLICATION = "INSERT INTO loan_application (category, value) VALUES (?, ?) ON CONFLICT(category) DO UPDATE SET value = excluded.value",
	SELECT_LOAN_APPLICATION = "SELECT * FROM loan_application WHERE category = ?",
	UPDATE_LOAN_APPLICATION = "UPDATE loan_application SET value = ? WHERE category = ?",
	DELETE_LOAN_APPLICATION = "DELETE FROM loan_application",
	DELETE_TABLE_LOAN_APPLICATION = "DROP TABLE IF EXISTS loan_application",
}

export const enum FundPurposeStatement {
	CREATE_TABLE_FUND_PURPOSE = "CREATE TABLE IF NOT EXISTS fund_purpose (id INTEGER PRIMARY KEY AUTOINCREMENT, value TEXT)",
	INSERT_FUND_PURPOSE = "INSERT INTO fund_purpose (value) VALUES (?)",
	SELECT_FUND_PURPOSE = "SELECT * FROM fund_purpose",
	SELECT_COUNT_FUND_PURPOSE = "SELECT COUNT(*) AS totalCount FROM fund_purpose",
	UPDATE_FUND_PURPOSE = "UPDATE fund_purpose SET value = ? WHERE id = ?",
}

export const enum LoanProductStatement {
	CREATE_TABLE_LOAN_PRODUCT = "CREATE TABLE IF NOT EXISTS loan_product (id INTEGER PRIMARY KEY AUTOINCREMENT, value TEXT)",
	INSERT_LOAN_PRODUCT = "INSERT INTO loan_product (value) VALUES (?)",
	SELECT_LOAN_PRODUCT = "SELECT * FROM loan_product",
	SELECT_COUNT_LOAN_PRODUCT = "SELECT COUNT(*) AS totalCount FROM loan_product",
	UPDATE_LOAN_PRODUCT = "UPDATE loan_product SET value = ? WHERE id = ?"
}

export const enum CommonStandardCodeStatement {
	CREATE_TABLE_COMMON_STANDARD_CODE = "CREATE TABLE IF NOT EXISTS common_standard_code (id INTEGER PRIMARY KEY AUTOINCREMENT, value TEXT, category VARCHAR(255), type VARCHAR(255))",
	INSERT_COMMON_STANDARD_CODE = "INSERT INTO common_standard_code (value, category, type) VALUES (?, ?, ?)",
	SELECT_COMMON_STANDARD_CODE = "SELECT * FROM common_standard_code WHERE category = ? AND type = ?",
	SELECT_COUNT_COMMON_STANDARD_CODE = "SELECT COUNT(*) AS totalCount FROM common_standard_code WHERE category = ? AND type = ?",
	UPDATE_COMMON_STANDARD_CODE = "UPDATE common_standard_code SET value = ? WHERE id = ? AND category = ? AND type = ?",
	DELETE_COMMON_STANDARD_CODE = "DELETE FROM common_standard_code WHERE category = ? AND type = ?",
	DELETE_TABLE_COMMON_STANDARD_CODE = "DROP TABLE IF EXISTS common_standard_code",
}

export const enum IndustryCategoryStatement {
	CREATE_TABLE_INDUSTRY_CATEGORY = "CREATE TABLE IF NOT EXISTS industry_category (id INTEGER PRIMARY KEY AUTOINCREMENT, value TEXT)",
	INSERT_INDUSTRY_CATEGORY = "INSERT INTO industry_category (value) VALUES (?)",
	SELECT_INDUSTRY_CATEGORY = "SELECT * FROM industry_category",
	SELECT_COUNT_INDUSTRY_CATEGORY = "SELECT COUNT(*) AS totalCount FROM industry_category",
	UPDATE_INDUSTRY_CATEGORY = "UPDATE industry_category SET value = ? WHERE id = ?",
}
