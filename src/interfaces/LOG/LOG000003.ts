export interface LOG000003Request {
	userId: string,
	companyId: string,
	password: string,
}
export interface LOG000003Response {
	userInfo: LOG000003UserInfo,
	tokenInfo: LOG000003TokenInfo,
}
export interface LOG000003UserInfo {
	userId: string,
	email: string,
	firstName: string,
	lastName: string,
	userFirstLocalName: string,
	userLastLocalName: string,
	genderCode: string,
	birthDate: string,
	cellPhoneNo: string,
	userAddress: string,
	trxBranchCode: string,
	actualTrxBranchCode: string,
	jobTitleCode: string,
	jobPositionCode: string,
	joiningDate: string,
	userRoleList: string[],
}

export interface LOG000003TokenInfo {
	token: string,
	expiresIn: number,
	tokenType: string,
	refreshToken: string,
	refreshTokenExpiresIn: number,
}
