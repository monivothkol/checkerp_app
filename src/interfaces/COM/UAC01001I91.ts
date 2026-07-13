export interface UAC01001I91Request {
	userID?: string;
	userName?: string;
	cellPhoneNo?: string;
	cellPhoneNoPrefix?: string;
	workStatusCode?: string;
	pageSize?: number;
	pageNumber?: number;
}

export interface UAC01001I91Response {
	totalCount: number;
	userList: UAC01001I91Item[];
}

export interface UAC01001I91Item {
	userID: string;
	workStatusCode: string;
	userTypeCode: string;
	userFirstName: string;
	userLastName: string;
	genderCode: string;
	birthDate: string;
	cellPhoneNoPrefix: string;
	officePhoneNoPrefix: string;
	cellPhoneNo: string;
	officePhoneNo: string;
	userAddress: string;
	branchCode: string;
	branchName: string;
	sourceBranchCode: string;
	employeeInfoBranchCode: string;
	jobTitleCode: string;
	jobPositionCode: string;
	salaryClass: string;
	joiningDate: string;
	retirementDate: string;
	employeeSyncTypeCode: string;
	transactionGradeCode: string;
	transactionActiveYN: string;
	userExceptionTypeCode: string;
	absenteeYN: string;
	substituteApprovalEmpNo: string;
	chargeResponsibleEmpNo: string;
	groupwareNoticeSMSReceiveYN: string;
	userTitleTypeCode: string;
	emailAddress: string;
	customerNo: string;
	userClsDate: string;
	userFirstLocalName: string;
	userLastLocalName: string;
	postalCode: string;
}
