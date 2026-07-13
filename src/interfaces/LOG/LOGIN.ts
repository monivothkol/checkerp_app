export interface LOGINRequest {
	userId: string,
	password: string,
	companyId: string,
	platformType: string,
	deviceId: string
}
export interface LOGINResponse {
	passwordChangeRequiredYN: string,
	authenticatorSetupYN: string,
	otpSendLockedYN: string,
	otpSendLockedRemainingSeconds: number,
	otpPhoneNoPrefix: string,
	otpPhoneNo: string,
	otpEmailAddress: string,
	processId: string,
	authenticationCode: string,
	authenticationMethod: string
}
