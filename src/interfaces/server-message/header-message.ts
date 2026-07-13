/**
 * Message response information (also returned by the server in response headers)
 */
export interface MessageInfo {
	/** Result status (e.g., SUCCESS, ERROR) */
	result: boolean;
	/** Response code */
	code: string;
	/** Main message text */
	message: string;
	/** Detailed message description */
	detailMessage: string;
}

/**
 * Request header sent with every transaction.
 * Slim CHECK ERP envelope: correlation + audit fields only.
 * Security is enforced by TLS + the Authorization bearer token,
 * never by header contents (client-supplied values are not trusted).
 */
export interface HeaderMessage {
	/** Unique request id for tracing/idempotency */
	uuid: string;
	/** Transaction code being called (e.g., AUT10000) */
	serviceId: string;
	/** Screen the request originated from (route name) */
	screenId: string;
	/** ID of the logged-in user (audit only; server must rely on the token) */
	userId: string;
	/** UI locale (e.g., en-US, km-KH) */
	locale: string;
	/** Business date YYYYMMDD */
	businessDate: string;
	/** Transaction time HHmmssSSS */
	transactionTime: string;
	/** Result info; filled by the server in responses */
	messageInfo: MessageInfo;
}
