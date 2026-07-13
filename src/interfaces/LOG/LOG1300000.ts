export interface LOG1310000Request {
	userId: string;
	authentication: string;
}

export interface LOG1310000Response {
	status: string;
	message: string;
	result: boolean;
}

export interface LOG1300000Request {
	companyID: string;
	userId: string;
	email: string;
}

export interface LOG1300000Response {
	status: string;
	message: string;
	result: boolean;
	authenticationCode: string;
}

export interface LOG131000RRequest {
	companyID: string;
	userId: string;
	password: string;
}

export interface LOG131000RResponse {
	status: string;
	message: string;
	result: boolean;
}
