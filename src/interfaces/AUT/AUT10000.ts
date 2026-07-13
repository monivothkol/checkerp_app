export interface AUT10000Request {
	companyId: string;
	username: string;
	password: string;
}

export interface AUT10000Response {
	status: string;
	message: string;
	data: {
		accessToken: string;
		refreshToken: string;
		userId: string;
		userName: string;
	};
}

export interface AUT10000GoogleRequest {
	idToken: string;
}

export interface AUT10000GoogleResponse {
	status: string;
	message: string;
	data: {
		accessToken: string;
		refreshToken: string;
		userId: string;
		userName: string;
	};
}
