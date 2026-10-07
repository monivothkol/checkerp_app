/** AUT10000I01 — sign in to a company (subdomain) with username + password. The app is always tenant-scoped; the web-only main-domain owner login ({ mainDomain, email }) is not used here. */
export interface AUT10000I01Request {
	subdomain: string;
	username: string;
	password: string;
	deviceName?: string;
	deviceType?: string;
}

export interface AUT10000I01Response {
	accessToken: string;
	refreshToken: string;
	tokenType?: string;
	expiresInMinutes?: number;
	userId: string;
	username: string;
	userName?: string;
	companyId: string;
	companyCode?: string;
	companyName?: string;
	companyLogoUrl?: string;
	/** Inventories this user may sell from, primary first; empty = unrestricted. */
	assignedInventoryIds?: string[];
}

/** AUT10000I03 — revoke this device's session. */
export interface AUT10000I03Request {
	refreshToken: string;
}

/** What the app keeps about the signed-in user (DataStorage "userInfo"), same shape as the web. */
export interface UserInfo {
	userId: string;
	userName?: string;
	username: string;
	companyId: string;
	companyCode?: string;
	companyName?: string;
	companyLogoUrl?: string;
	assignedInventoryIds: string[];
}
