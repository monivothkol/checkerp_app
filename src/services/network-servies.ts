import { TableFailedTransactionStatement } from "@/enum/table-statement";
import HttpNetwork from "@/modules/http-network";
import DialogUtil from "@/utilities/dialog-util";
import NetworkStatusUpdate from "@/utilities/network-status-update";
import OfflineModeUpdate from "@/utilities/offline-mode-update";
import AppConfig, { BizCheckMobileApp, BizCheckMobileDatabase, BizCheckMobileDevice, BizCheckMobileFStorage, BizCheckMobileLogger, BizCheckMobileNetwork, BizCheckMobileProperties } from "@/shared/bizcheckmobile";
import { CrashlyticsPluginService } from "./crashlytics-plugin-service";
import CheckErpHeader from "./checkerp-header";
import DocumentUploadService from "./document-upload-service";
import EncryptionService from "./encryption-service";
import { getTokenSync } from "./token-store";
import LocalServices from "./local-services";
import RouterServices from "./router-services";
import { onHaptic } from "@/utilities/haptic-utils";
import SyncFailedTransaction from "./sync-failed-transaction";

// ============================================================================
// Constants
// ============================================================================

/** API Endpoint identifiers */
const API_ENDPOINTS = {
	TOKEN: "token",
	INTROSPECT: "introspect",
	REFRESH: "refresh",
	REVOKE_TOKEN: "revoke-token",
	CHECK_TOKEN: "check-token"
} as const;

/** IAM OAuth endpoints requiring special handling */
const IAM_OAUTH_ENDPOINTS = [
	API_ENDPOINTS.TOKEN,
	API_ENDPOINTS.INTROSPECT,
	API_ENDPOINTS.REFRESH,
	API_ENDPOINTS.CHECK_TOKEN,
	API_ENDPOINTS.REVOKE_TOKEN
];

/** IAM Authentication endpoints */
const IAM_AUTH_ENDPOINTS = [
	"create-totp",
	"modify-password",
	"start-register-bio",
	"start-verify-bio",
	"login-password",
	"verify-bio",
	"start-login-bio",
	"login-bio",
	"login",
	"send-otp",
	"verify-otp",
	"verify-password",
	"unregister-bio",
	"register-bio"
];

/** Error code categories for error handling logic */
const ERROR_CODE_CATEGORIES = {
	CRITICAL: ["FRW_COR_ERR_008", "500", "404", "503", "504"],
	TOKEN_EXPIRED: ["FRW_SEC_E004", "FRW_SEC_E005"],
	SESSION_EXPIRED: ["IAM_E002"]
} as const;

/** HTTP status codes */
const HTTP_STATUS_CODES = {
	BAD_REQUEST: 400,
	SERVER_ERROR: 500,
	METHOD_NOT_ALLOWED: 405,
	GATEWAY_TIMEOUT: 504
} as const;

/** trCodes callable without a stored token (login / register / token refresh). */
const PUBLIC_TR_CODES = ["AUT10000", "AUT11000", "AUT12000"];

const DEFAULT_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours
const DEFAULT_SHORT_TIMEOUT = 2 * 60 * 1000; // 2 minutes
const MAX_CONCURRENT_ERROR_ALERTS = 1;
const MOCK_RESPONSE_DELAY = 400; // ms

// ============================================================================
// Interfaces and Types
// ============================================================================

/**
 * Request queue entry for tracking pending requests
 */
interface RequestQueueEntry {
	execute: () => void;
	status: "PENDING" | "ERROR" | "SUCCESS";
}

/**
 * Response header structure from server
 */
interface ResponseHeader {
	result?: boolean;
	error_code?: string;
	error_message?: string;
	error_text?: string;
	code?: string;
	message?: string;
	messageInfo?: MessageInfo;
	serviceId?: string;
}

/**
 * Message info from response header
 */
interface MessageInfo {
	result: boolean;
	code: string;
	message: string;
	detailMessage: string;
}

// ============================================================================
// NetworkServices Class
// ============================================================================

/**
 * Comprehensive network service for handling API requests, authentication, and error management.
 *
 * Features:
 * - Dual platform support (native app and web browser)
 * - IAM token management with automatic refresh
 * - Offline mode support with transaction caching
 * - Request queuing and error recovery
 * - Loading state management
 * - Session expiration handling
 */
export default class NetworkServices {
	private readonly httpNetwork: HttpNetwork;
	private readonly checkErpHeader: CheckErpHeader;
	private readonly encryptService: EncryptionService;
	private readonly routerService: RouterServices;
	private static requestQueue: Map<string, RequestQueueEntry> = new Map();
	private activeRequestCount: number = 0;
	private static errorCount: number = 0;
	private cached: Map<string, any> = new Map();
	private localeService: LocalServices;

	/**
	 * Initialize NetworkServices with required dependencies
	 */
	constructor() {
		this.httpNetwork = HttpNetwork.getInstance();
		this.checkErpHeader = new CheckErpHeader();
		this.encryptService = EncryptionService.getInstance();
		this.routerService = new RouterServices();
		this.localeService = new LocalServices();
	}

	// ========================================================================
	// Public API Methods
	// ========================================================================

	/**
	 * Execute a standard API request
	 * @param trCode - Transaction code for the API endpoint
	 * @param option - Request configuration options
	 */
	public request(trCode: string, option: HttpRequestOptions): void {
		CrashlyticsPluginService.logApiCall(trCode);
		const execute = (): void => {
			const authInfo = this.getAuthInfo();
			// Handle network status before executing request, in case no internet connection or server is unreachable
			if (!option.allowSaveOffline && this.isOffline() && !this.isNetworkStatus()) {
				BizCheckMobileLogger.warn("No network connection. Caching request for later synchronization.");
				if (option.dataOpt) {
					option.onSuccess(option.dataOpt);
				}
				return;
			}

			if (option.removeCacheKeys) {
				option.removeCacheKeys.forEach((key: string) => {
					for (const cacheKey of this.cached.keys()) {
						if (cacheKey.startsWith(key)) {
							this.cached.delete(cacheKey);
						}
					}
				});
			};

			const resCached = this.cached.get(NetworkServices.buildRequestCacheKey(trCode, option.body));

			if (option.saveCache && resCached) {
				option.onSuccess(resCached);
				return;
			}

			if (option.snapshot && resCached) {
				option.onSuccess(resCached);
			}

			// Handle offline mode
			if (this.isOffline() && option.allowSaveOffline) {
				BizCheckMobileLogger.warn("Device is offline. Caching request for later synchronization.");
				BizCheckMobileLogger.log("Offline request => ", { trCode, body: option.body });
				this.handleOfflineRequest(trCode, option);
				return;
			}

			// Show loading indicator if requested
			if (option.enableLoading && !DialogUtil.isLoadingOpen && !option.snapshot && !resCached) {
				DialogUtil.showLoading();
			}

			// Verify authentication is available (login/register run without a token)
			if (!PUBLIC_TR_CODES.includes(trCode) && !this.isAuthenticated(authInfo)) {

				BizCheckMobileLogger.info(trCode);

				NetworkServices.errorCount++;

				// Always dismiss the spinner before bailing out, otherwise the
				// loading overlay stays open forever on repeated failures.
				setTimeout(() => {
					this.closeLoading();
				}, 200);

				if (NetworkServices.errorCount > 1) return;

				DialogUtil.showAlert({ header: "Security", message: "Unauthorized User Login. Please Re-login again" });
				return;
			}

			this.configureNetworkHeaders(authInfo);
			if (!option.multipart && option.filePaths && option.filePaths.length > 0) {
				new DocumentUploadService().uploadImageByPath({
					path: option.filePaths, callback: (filesList) => {

						if (option.fieldName && option.body[option.fieldName]) {
							option.body[option.fieldName] = filesList;
						}

						this.performRequest(trCode, option);
					}
				});
				return;
			}

			BizCheckMobileLogger.info("multipart => ", { multipartFilePaths: option.multipartFilePaths, multipartFieldName: option.multipartFieldName, target: option.targetFieldMapFileID });

			if (option.multipart && option.multipartFilePaths && Object.keys(option.multipartFilePaths).length > 0) {
				const fileKeys = Object.keys(option.multipartFilePaths);
				let uploadCount = 0;
				for (const key of fileKeys) {
					if (option.multipartFilePaths[key] && option.multipartFilePaths[key].paths && option.multipartFilePaths[key].paths.length > 0) {
						new DocumentUploadService().uploadImageByPath({
							path: option.multipartFilePaths[key].paths,
							callback: (filesList) => {
								for (const element of option.multipartFieldName || []) {
									BizCheckMobileLogger.info("element => ", element, key);
									if (fileKeys.includes(element)) {
										uploadCount++;
										if (typeof option.body[element] === "string") {
											BizCheckMobileLogger.info("element => ", key, element, typeof option.body[element]);
											option.body[element] = filesList[0].fileId;
											BizCheckMobileLogger.info("element => ", key, option.body[element]);
										}

										if (typeof option.body[element] === "object") { // attachementFile = {...}
											for (const target of option.targetFieldMapFileID || []) { // {hhhh}
												if (option.body[element] && option.body[element][target]) {
													option.body[element] = { ...option.body[element], ...filesList[0] };
													option.body[element][target] = filesList[0].fileId;
												}
											}
										}

										if (option.body[element] && Array.isArray(option.body[element])) {
											BizCheckMobileLogger.info("element array => ", key, element, Array.isArray(option.body[element]));
											for (const target1 of option.targetFieldMapFileID || []) {
												option.body[element] = option.body[element].map((item: any) => {
													return {
														...item,
														...filesList[0],
														[target1]: filesList[0].fileId
													};
												});
												BizCheckMobileLogger.info("element array => ", key, element, option.body[element]);
											}
										}
									}
									if (uploadCount === fileKeys.length) {
										BizCheckMobileLogger.info("uploadCount => ", uploadCount, fileKeys.length);
										BizCheckMobileLogger.info("request info => ", option.body, uploadCount, fileKeys.length, fileKeys);
										this.performRequest(trCode, option);
									}
								}
							}
						});
					}
				}

				return;
			}

			this.performRequest(trCode, option);
		};

		this.enqueueRequest(trCode, execute);
	}

	private setLastEventTime(): void {
		BizCheckMobileProperties.set("lastEventTime", new Date().getTime());
	}

	/**
	 * Execute IAM (Identity & Access Management) request
	 * @param option - IAM request configuration
	 */
	public iam(option: HttpRequestOptions): void {
		const execute = (): void => {
			const subdomain = this.getSubdomain();

			if (option.enableLoading && !DialogUtil.isLoadingOpen) {
				DialogUtil.showLoading();
			}

			this.activeRequestCount++;
			this.configureIamHeaders(option);


			this.encryptService.prepareKeys({
				trCode: option.endPoint || "iam",
				callback: (shared) => {
					BizCheckMobileLogger.info("prepareKeys in iam response => ", shared, option.body);
					this.encryptService.encrypt({
						data: { payload: option.body },
						trCode: shared.requestId,
						callback: (encrypted) => {
							BizCheckMobileLogger.info("encrypt in iam response => ", encrypted);
							if (BizCheckMobileDevice.isApp()) {
								this.performNativeIamRequest(option, subdomain, shared);

							} else {
								this.performWebIamRequest(option, subdomain, encrypted, shared);
							}
						}
					});

					// this.performWebIamRequest(option, subdomain);
				}
			});
		};

		this.enqueueRequest(option.endPoint || "iam", execute);
	}

	/**
	 * Fetch application theme configuration
	 * @returns Promise resolving to theme configuration
	 */
	public appTheme(): Promise<any> {
		return new Promise((resolve, reject) => {
			const subdomain = this.getSubdomain();

			if (BizCheckMobileDevice.isApp()) {
				this.fetchNativeAppTheme(subdomain, resolve);
			} else {
				this.fetchWebAppTheme(subdomain, resolve, reject);
			}
		});
	}

	// ========================================================================
	// Authentication and Configuration
	// ========================================================================

	/**
	 * Get stored authentication information
	 * @returns Parsed authentication token or empty object
	 */
	private getAuthInfo(): Record<string, any> {
		// token-store holds the decrypted token in memory (hydrated at boot).
		const token = getTokenSync();
		return token && Object.keys(token).length > 0 ? (token as Record<string, any>) : {};
	}

	/**
	 * Check if user is authenticated
	 */
	private isAuthenticated(authInfo: Record<string, any>): boolean {
		return authInfo && Object.keys(authInfo).length > 0;
	}

	/**
	 * Check if system is in offline mode
	 */
	private isOffline(): boolean {
		return OfflineModeUpdate.status;
	}

	/**
	 * Whether the device reports an active network connection (NetworkStatusUpdate).
	 */
	private isNetworkStatus(): boolean {
		return NetworkStatusUpdate.status.result;
	}

	/** Stable cache key for snapshot / saveCache lookups (must match set and get). */
	private static buildRequestCacheKey(trCode: string, body: Record<string, any>): string {
		return `${trCode}_${JSON.stringify(body)}`;
	}

	/**
	 * Get subdomain from storage
	 * @returns Subdomain string or empty string
	 */
	private getSubdomain(): string {
		return BizCheckMobileProperties.get("app_subdomain") || "";
	}

	/**
	 * Setup standard network headers with bearer token
	 */
	private configureNetworkHeaders(authInfo: Record<string, any>): void {
		AppConfig.setNetwork({
			...AppConfig.network,
			headers: {
				...AppConfig.network.headers,
				"Content-Type": "application/json",
				"Authorization": `Bearer ${authInfo.accessToken}`
			}
		});
	}

	/**
	 * Configure headers based on IAM endpoint type
	 */
	private configureIamHeaders(option: HttpRequestOptions): void {
		const authInfo = this.getAuthInfo();

		if (IAM_OAUTH_ENDPOINTS.includes(option.endPoint as any)) {
			if (["revoke-token", "check-token"].includes(option.endPoint as string)) {
				AppConfig.setNetwork({
					...AppConfig.network,
					headers: {
						...AppConfig.network.headers,
						"Content-Type": "application/json",
						"Authorization": `Bearer ${authInfo.accessToken}`,
						"Accept-Language": BizCheckMobileProperties.get("locale")
					}
				});
			} else {
				// OAuth token endpoints require Basic auth
				AppConfig.setNetwork({
					...AppConfig.network,
					headers: {
						...AppConfig.network.headers,
						"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
						"Authorization": `Basic ${btoa(authInfo.clientId + ":" + authInfo.clientSecret)}`
					}
				});
			}
		} else if (IAM_AUTH_ENDPOINTS.includes(option.endPoint as any) && !["login", "send-otp", "verify-otp"].includes(option.endPoint as any)) {
			// Auth endpoints require Bearer token
			AppConfig.setNetwork({
				...AppConfig.network,
				headers: {
					...AppConfig.network.headers,
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authInfo.accessToken}`,
					"Accept-Language": BizCheckMobileProperties.get("locale")
				}
			});
		} else {
			// Default IAM headers
			AppConfig.setNetwork({
				...AppConfig.network,
				headers: {
					...AppConfig.network.headers,
					"Content-Type": "application/json",
					"Accept-Language": BizCheckMobileProperties.get("locale")
				}
			});
		}
	}

	// ========================================================================
	// Request Execution
	// ========================================================================

	/**
	 * Handle offline request by caching to local storage
	 */
	private handleOfflineRequest(trCode: string, option: HttpRequestOptions): void {

		const failureReason = "You are currently offline. Your request has been saved and will be synchronize once you are back online.";

		this.closeLoading();

		if (!option.transactionCategory || !option.transactionType) {
			BizCheckMobileLogger.warn("Transaction category or type is missing for offline request", { trCode, option });
			DialogUtil.showAlert({ header: "Offline", message: "Transaction category or type is missing for offline request." });
			return;
		}

		const data = { body: option.body, filePaths: option.filePaths, fieldName: option.fieldName, multipartFieldName: option.multipartFieldName, multipartFilePaths: option.multipartFilePaths, targetFieldMapFileID: option.targetFieldMapFileID, multipart: option.multipart };
		if (option.idOfflineData) {
			BizCheckMobileDatabase.executeSql({
				sql: TableFailedTransactionStatement.UPDATE_FAILED_TRANSACTION_BY_ID,
				params: ["00", JSON.stringify(data), failureReason, Number(option.idOfflineData)],
				onError: (error) => {
					BizCheckMobileLogger.error("executeSql Update Failed Transaction by Id ", error);
					DialogUtil.showAlert({ header: "Offline", message: "Failed to save your data in request offline. Please try again." });
				},
				onSuccess: (result) => {
					BizCheckMobileLogger.info("executeSql Update Failed Transaction by Id ", result);
					DialogUtil.showAlert({
						header: "Offline", message: "You are currently offline. Your request has been saved and will be synchronized once you are back online.",
						onDidDismiss: () => {
							option.onSuccess({ result: true });
						}
					});
				}
			});
		} else {
			SyncFailedTransaction.getInstance().insertFailedTransaction(JSON.stringify(data), "00", trCode, option.transactionType, option.transactionCategory, failureReason, (res: boolean) => {
				option.onSuccess({ result: res });
			});
		}
	}

	/**
	 * Route request to appropriate execution method
	 */
	private performRequest(trCode: string, option: HttpRequestOptions): void {
		this.activeRequestCount++;
		if (option.isMock) {
			this.performMockRequest(trCode, option);
		} else if (BizCheckMobileDevice.isApp()) {
			this.performNativeRequest(trCode, option);
		} else {
			this.performWebRequest(trCode, option);
		}
	}

	/**
	 * Execute mock request for testing
	 */
	private performMockRequest(trCode: string, option: HttpRequestOptions): void {
		BizCheckMobileNetwork.requestMock({
			trCode,
			url: `${import.meta.env.VITE_API_MOCK_URL}/${trCode}.json`,
			callback: (response) => {
				BizCheckMobileLogger.log("Mock response received", { trCode, response });
				setTimeout(() => {
					this.checkResponse(response, { ...option, onSuccess: (res) => option.onSuccess?.(res), }, trCode);
				}, MOCK_RESPONSE_DELAY);
			}
		}).catch((error) => {
			BizCheckMobileLogger.error("Mock request failed", error);
			DialogUtil.showAlert({ header: "Mock Error", message: "Failed to process mock request. Please check configuration." });
			this.handleRequestCompletion();
		});
	}

	/**
	 * Execute request on native app platform
	 */
	private performNativeRequest(trCode: string, option: HttpRequestOptions): void {
		const header = this.checkErpHeader.getHeader(trCode);
		const requestBody = { header, payload: option.body };
		const subdomain = this.getSubdomain();
		const url = `${import.meta.env.VITE_SERVER_PROTOCOL}://${subdomain ? subdomain + "." : ""}${import.meta.env.VITE_SERVER_DOMAIN}/${import.meta.env.VITE_SERVER_CONTEXT}/${trCode}`;

		BizCheckMobileLogger.log(`Native request: ${trCode}`, requestBody);
		this.encryptService.prepareKeys({
			trCode: trCode,
			callback: (shared) => {
				this.encryptService.encrypt({
					data: requestBody,
					trCode: shared.requestId,
					callback: (encrypted) => {
						BizCheckMobileLogger.info("encrypt in native request response => ", encrypted);
						BizCheckMobileApp.callPlugin({
							pluginKey: "LOS_COMMUNICATION_PLUGIN",
							params: {
								url,
								header: AppConfig.network.headers,
								body: requestBody,
								read_timeout: 120,
								encrypt: JSON.parse(import.meta.env.VITE_ENABLE_ENCRYPT),
								keyId: shared.keyId,
								publicKey: shared.publicKey,
							},
							callback: (response: any) => {
								this.encryptService.decrypt({
									data: response,
									trCode: shared.requestId,
									callback: (decrypted) => {
										BizCheckMobileLogger.info("decrypt response data => ", decrypted);
										this.checkResponse(decrypted, option, trCode);
									}
								});
							}
						});
					}
				});
			}
		});
	}

	/**
	 * Execute request in web browser
	 */
	private performWebRequest(trCode: string, option: HttpRequestOptions): void {
		const header = this.checkErpHeader.getHeader(trCode);
		const requestBody = { header, payload: option.body };

		const authInfo = this.getAuthInfo();
		const subdomain = this.getSubdomain();

		BizCheckMobileLogger.log(`Web request: ${trCode}`, requestBody);
		this.encryptService.prepareKeys({
			trCode: trCode,
			callback: (shared) => {
				this.encryptService.encrypt({
					data: requestBody,
					trCode: shared.requestId,
					callback: (encrypted) => {
						AppConfig.setNetwork({
							...AppConfig.network,
							method: "POST",
							headers: {
								...AppConfig.network.headers,
								"Content-Type": "application/json",
								"X-Client-PublicKey": shared.clientKey,
								"Authorization": `Bearer ${authInfo.accessToken}`
							}
						});
						const httpOptions = this.httpNetwork.getHttpOptions({
							// body: JSON.stringify(requestBody),
							body: JSON.stringify(encrypted),
							method: AppConfig.network.method,
						});
						BizCheckMobileLogger.log("httpOptions => ", httpOptions);
						if (subdomain && httpOptions.headers) {
							httpOptions.headers["X-Subdomain"] = subdomain;
						}

						const url = `/alias-server/${import.meta.env.VITE_SERVER_CONTEXT}/${trCode}`;

						BizCheckMobileNetwork.requestHttp({
							url,
							httpOptions: httpOptions,
							timeout: DEFAULT_TIMEOUT,
							method: "POST",
							body: httpOptions.body
						}).then((response) => {
							this.encryptService.decrypt({
								data: response,
								trCode: shared.requestId,
								callback: (decrypted) => {
									BizCheckMobileLogger.info("decrypt response data => ", decrypted);
									this.checkResponse(decrypted, option, trCode);
								}
							});
							// this.checkResponse(response, option, trCode);
						}).catch((error) => {
							this.handleRequestError(error, option);
						});
					}
				});
			}
		});
	}

	// ========================================================================
	// IAM Request Execution
	// ========================================================================

	/**
	 * Execute native IAM request
	 */
	private performNativeIamRequest(option: HttpRequestOptions, subdomain: string, shared: any): void {
		const authInfo = this.getAuthInfo();

		if (IAM_OAUTH_ENDPOINTS.includes(option.endPoint as any)) {
			if (["revoke-token", "check-token"].includes(option.endPoint as string)) {
				this.performNativeAuthRequest(option, subdomain, shared);
			} else {
				this.performNativeOAuthRequest(option, subdomain, shared);
			}
		} else {
			this.performNativeAuthRequest(option, subdomain, shared);
		}
	}

	/**
	 * Execute OAuth token endpoint request on native platform
	 */
	private performNativeOAuthRequest(
		option: HttpRequestOptions,
		subdomain: string,
		shared: any
	): void {
		const url = `${import.meta.env.VITE_SERVER_PROTOCOL}://${subdomain ? subdomain + "." : ""}${import.meta.env.VITE_SERVER_DOMAIN}/${option.endPoint === "revoke-token" ? import.meta.env.VITE_AUTH_SERVER_URL : import.meta.env.VITE_AUTH_2_SERVER_URL}/${option.endPoint}`;
		const bodyParams = this.buildOAuthBodyParams(option);
		const pluginKey = this.getOAuthPluginKey(bodyParams.grant_type === "refresh_token" ? "refresh" : option.endPoint as any);

		const requestBody = {
			url,
			...bodyParams,
			encrypt: JSON.parse(import.meta.env.VITE_ENABLE_ENCRYPT || "false"),
			keyId: shared.keyId,
			publicKey: shared.publicKey,
		};

		BizCheckMobileLogger.info(`Native OAuth request: ${option.endPoint}`, requestBody);

		BizCheckMobileApp.callPlugin({
			pluginKey,
			params: {
				header: { result: false },
				body: requestBody
			},
			callback: (response) => {
				this.handleIamResponse(response, option);
			}
		});
	}

	/**
	 * Execute non-OAuth IAM request on native platform
	 */
	private performNativeAuthRequest(option: HttpRequestOptions, subdomain: string, shared: any): void {
		const url = `${import.meta.env.VITE_SERVER_PROTOCOL}://${subdomain ? subdomain + "." : ""}${import.meta.env.VITE_SERVER_DOMAIN}/${import.meta.env.VITE_AUTH_SERVER_URL}/${option.endPoint}`;

		const requestBody = {
			url,
			header: AppConfig.network.headers,
			body: { payload: option.body },
			read_timeout: 120,
			encrypt: JSON.parse(import.meta.env.VITE_ENABLE_ENCRYPT),
			keyId: shared.keyId,
			publicKey: shared.publicKey,
		};

		BizCheckMobileLogger.info(`Native auth request: ${option.endPoint}`, requestBody);

		BizCheckMobileApp.callPlugin({
			pluginKey: "LOS_COMMUNICATION_PLUGIN",
			params: requestBody,
			callback: (response: any) => {
				this.handleIamResponse(response, option);
			}
		}).catch((error) => {
			this.handleIamError(error, option);
		});
	}

	/**
	 * Execute web-based IAM request
	 */
	private performWebIamRequest(option: HttpRequestOptions, subdomain: string, encrypted: any, shared: any): void {
		let url: string;
		let httpOptions: Record<string, any>;
		const authInfo = this.getAuthInfo();

		if (IAM_OAUTH_ENDPOINTS.includes(option.endPoint as any)) {
			if (["revoke-token", "check-token"].includes(option.endPoint as string)) {
				url = `/alias-server/${import.meta.env.VITE_AUTH_SERVER_URL}/${option.endPoint}`;
				AppConfig.setNetwork({
					...AppConfig.network,
					method: "POST",
					headers: {
						...AppConfig.network.headers,
						"Content-Type": "application/json",
						"X-Client-PublicKey": shared.clientKey
					}
				});
				httpOptions = this.httpNetwork.getHttpOptions({
					body: JSON.stringify(encrypted),
					method: AppConfig.network.method,
				});
			} else {
				url = `/alias-server/${import.meta.env.VITE_AUTH_2_SERVER_URL}/${option.endPoint}`;
				AppConfig.setNetwork({
					...AppConfig.network,
					method: "POST",
					headers: {
						...AppConfig.network.headers,
						"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
						"X-Client-PublicKey": shared.clientKey,
						"Authorization": `Basic ${btoa(authInfo.clientId + ":" + authInfo.clientSecret)}`
					}
				});
				const bodyParams = this.buildOAuthBodyParams(option);
				httpOptions = this.httpNetwork.getHttpOptions({
					body: new URLSearchParams(bodyParams as Record<string, string>).toString(),
					method: AppConfig.network.method,
				});
			}
		} else {
			url = `/alias-server/${import.meta.env.VITE_AUTH_SERVER_URL}/${option.endPoint}`;
			AppConfig.setNetwork({
				...AppConfig.network,
				method: "POST",
				headers: {
					...AppConfig.network.headers,
					"Content-Type": "application/json",
					"X-Client-PublicKey": shared.clientKey,
					"Authorization": `Bearer ${authInfo.accessToken}`,
				}
			});
			httpOptions = this.httpNetwork.getHttpOptions({
				body: JSON.stringify(encrypted),
				method: AppConfig.network.method,
			});
		}

		if (subdomain && httpOptions.headers) {
			httpOptions.headers["X-Subdomain"] = subdomain;
		}

		BizCheckMobileNetwork.requestHttp({ url, httpOptions: httpOptions, timeout: DEFAULT_SHORT_TIMEOUT, method: "POST", body: httpOptions.body }).then((response: any) => {
			this.encryptService.decrypt({
				data: response,
				trCode: shared.requestId,
				callback: (decrypted) => {
					BizCheckMobileLogger.info("decrypt response => ", decrypted);
					this.handleIamResponse(decrypted, option);
				}
			});
		}).catch((error) => {
			this.handleIamError(error, option);
		});
	}

	/**
	 * Build OAuth request body based on grant type
	 */
	private buildOAuthBodyParams(option: HttpRequestOptions): Record<string, any> {
		const authInfo = this.getAuthInfo();
		const endpoint = option.endPoint;
		const grantType = option.body?.grant_type;

		switch (endpoint) {
			case API_ENDPOINTS.TOKEN:

				if (grantType === "authorization_code") {
					if (BizCheckMobileDevice.isApp()) {
						return {
							redirectUri: "urn:ietf:wg:oauth:2.0:oob",
							code: authInfo.code,
							code_verifier: authInfo.codeVerifier,
							client_id: authInfo.clientId,
							client_secret: authInfo.clientSecret,
							grant_type: "authorization_code"
						};
					} else {
						return {
							client_id: authInfo.clientId,
							client_secret: authInfo.clientSecret,
							redirect_uri: "urn:ietf:wg:oauth:2.0:oob",
							code: authInfo.code,
							code_verifier: authInfo.codeVerifier,
							grant_type: "authorization_code"
						};
					}
				} else {
					return {
						client_id: authInfo.clientId,
						client_secret: authInfo.clientSecret,
						redirectUri: "urn:ietf:wg:oauth:2.0:oob",
						refresh_token: authInfo.refreshToken,
						code: authInfo.code,
						code_verifier: authInfo.codeVerifier,
						grant_type: "refresh_token"
					};
				}
			case API_ENDPOINTS.REVOKE_TOKEN:
				return { refresh_token: authInfo.refreshToken, access_token: authInfo.accessToken };

			case API_ENDPOINTS.INTROSPECT:
			default:
				return {};
		}
	}

	/**
	 * Get plugin key for OAuth endpoint
	 */
	private getOAuthPluginKey(endpoint: string): string {
		const pluginMap: Record<string, string> = {
			[API_ENDPOINTS.TOKEN]: "IAM_REQUEST_TOKEN",
			[API_ENDPOINTS.REVOKE_TOKEN]: "IAM_REVOKE",
			[API_ENDPOINTS.INTROSPECT]: "IAM_INTROSPECT",
			[API_ENDPOINTS.REFRESH]: "IAM_REFRESH_TOKEN"
		};
		return pluginMap[endpoint] || "LOS_COMMUNICATION_PLUGIN";
	}

	// ========================================================================
	// Response Handling
	// ========================================================================

	/**
	 * Process API response and handle errors
	 */
	private checkResponse(response: Record<string, any>, option: HttpRequestOptions, trCode: string): void {
		if (option.isMock) {
			this.handleRequestCompletion();
			const body = response.body ? response.body : response;
			option.onSuccess(body);
			return;
		}

		BizCheckMobileLogger.log("Response received", response);

		const header: ResponseHeader = response.header || {};
		const payload: Record<string, any> = response.payload;
		const messageInfo = this.extractMessageInfo(header);

		if (messageInfo.result) {
			NetworkServices.requestQueue.delete(trCode);
			BizCheckMobileLogger.info("deleted =>", `${trCode} SUCCESS..`);
			BizCheckMobileLogger.info("request queue padding => ", NetworkServices.requestQueue);
			// Successful response
			NetworkServices.errorCount = 0;
			this.handleRequestCompletion();

			if (option.saveCache || option.snapshot) {
				this.cached.set(NetworkServices.buildRequestCacheKey(trCode, option.body), payload);
			}

			if (option.idOfflineData) {
				BizCheckMobileDatabase.executeSql({
					sql: TableFailedTransactionStatement.DELETE_FAILED_TRANSACTION,
					params: [Number(option.idOfflineData)],
					onError: (error) => {
						BizCheckMobileLogger.error("executeSql delete Failed Transaction ", error);

					},
					onSuccess: (result) => {

						if ((trCode === "LEM12001A01" || trCode === "LEM12001A02") && payload.customerNo) {
							SyncFailedTransaction.getInstance().selectFailedTransactionByCategory("LAN", payload.customerNo, option.KeyID);
						}

						BizCheckMobileLogger.info("executeSql deleted Transaction ", result);
					}
				});
			}

			if (option.isHaptic) {
				onHaptic({ sound: true, vibration: true, positive: true });
			}
			option.onSuccess(payload);
		} else {
			// Error response
			this.handleResponseError(messageInfo, option, trCode);
		}
	}

	/**
	 * Extract message information from response header
	 */
	private extractMessageInfo(header: ResponseHeader): MessageInfo {
		if (header?.messageInfo) {
			return header.messageInfo;
		}

		return {
			result: header?.result ?? false,
			code: String(header?.error_code ?? header?.code ?? ""),
			message: header?.error_message ?? header?.message ?? header?.error_text ?? "",
			detailMessage: ""
		};
	}

	/**
	 * Handle response error based on error code
	 */
	private handleResponseError(messageInfo: MessageInfo, option: HttpRequestOptions, trCode: string): void {
		BizCheckMobileLogger.error("Response error", messageInfo);

		this.handleRequestCompletion();

		// Check for critical errors
		if (ERROR_CODE_CATEGORIES.CRITICAL.includes(messageInfo.code as any)) {
			NetworkServices.errorCount++;
			if (NetworkServices.errorCount === MAX_CONCURRENT_ERROR_ALERTS) {
				this.updateQueueStatus(trCode, "ERROR");
				DialogUtil.showAlert({ header: "Error", message: `${messageInfo.message} (${messageInfo.code})` });
			}
			return;
		}

		if (["FRW_SEC_E002"].includes(messageInfo.code)) {
			CrashlyticsPluginService.recordNonFatal(
				messageInfo.message || messageInfo.detailMessage || "Reactivate account, please re-login again",
				"reactivate_account",
				[
					{ key: "code", value: messageInfo.code },
					{ key: "trCode", value: trCode },
				]
			);

			NetworkServices.errorCount++;
			if (NetworkServices.errorCount > MAX_CONCURRENT_ERROR_ALERTS) return;

			DialogUtil.showAlert({
				header: this.localeService.translate("DAS1100000.TEXT.SECURITY_HEADER"),
				message: this.localeService.translate("DAS1100000.TEXT.SECURITY_REACTIVATE"),
				onDidDismiss: () => {
					DialogUtil.showLoading();
					this.clearSessionAndRedirect();
				}
			});
			return;
		}

		// Check for token expiration
		if (ERROR_CODE_CATEGORIES.TOKEN_EXPIRED.includes(messageInfo.code as any)) {
			NetworkServices.errorCount++;
			if (NetworkServices.errorCount === MAX_CONCURRENT_ERROR_ALERTS) {
				BizCheckMobileLogger.info("requestQueue => ", NetworkServices.requestQueue.entries());
				this.refreshTokenAndRetry();
			}
			return;
		}

		// Check for session expiration
		if (ERROR_CODE_CATEGORIES.SESSION_EXPIRED.includes(messageInfo.code as any)) {
			NetworkServices.errorCount++;
			if (NetworkServices.errorCount <= MAX_CONCURRENT_ERROR_ALERTS) {
				this.handleSessionExpiration();
			}
			return;
		}

		// Handle as general error
		if (option.isHaptic) {
			onHaptic({ sound: true, vibration: true, positive: false });
		}
		if (option.onFailed) {
			option.onFailed(messageInfo);
		} else {
			// No screen-level handler: never fail silently
			DialogUtil.showToast({ message: messageInfo.message || messageInfo.code || "Request failed" });
		}
	}

	/**
	 * Handle IAM response
	 */
	private handleIamResponse(response: Record<string, any>, option: HttpRequestOptions): void {

		BizCheckMobileLogger.log(`IAM response: ${option.endPoint}`, response);

		// Not mandatory check header status
		if (option.endPoint === "revoke-token") {
			option.onSuccess({});
			this.handleRequestCompletion();
			return;
		}

		if (!response?.header || response.header.result) {
			// Success
			const payload = response?.payload || response;
			// NetworkServices.errorCount = 0;
			option.onSuccess(payload);
			this.handleRequestCompletion();
		} else {
			// Error
			const code = response.header.code || response.header.error_code;
			const message = response.header.message || response.header.error_text;
			this.handleIamError({ code, message }, option);
		}
	}

	/**
	 * Handle IAM request error
	 */
	private handleIamError(error: any, option: HttpRequestOptions): void {
		BizCheckMobileLogger.error(`IAM error: ${option.endPoint}`, error);

		const code = error.code ?? error.status;
		const codeKey = String(code ?? "");

		this.handleRequestCompletion();

		// Check for critical errors
		if (ERROR_CODE_CATEGORIES.CRITICAL.includes(codeKey as any)) {
			NetworkServices.errorCount++;
			if (NetworkServices.errorCount === MAX_CONCURRENT_ERROR_ALERTS) {
				DialogUtil.showAlert({ header: "Error", message: `${error.statusText} (${codeKey})` });
			}
			return;
		}

		// Check for token errors
		if (ERROR_CODE_CATEGORIES.TOKEN_EXPIRED.includes(codeKey as any)) {
			NetworkServices.errorCount++;
			if (NetworkServices.errorCount === MAX_CONCURRENT_ERROR_ALERTS) {
				this.refreshTokenAndRetry();
			}
			return;
		}

		// Check for session errors
		if (ERROR_CODE_CATEGORIES.SESSION_EXPIRED.includes(codeKey as any)) {
			NetworkServices.errorCount++;
			if (NetworkServices.errorCount === MAX_CONCURRENT_ERROR_ALERTS) {
				this.handleRequestCompletion();
				this.handleSessionExpiration();
			}
			return;
		}

		// Handle as general error
		if (option.onFailed) option.onFailed(error);
	}

	/**
	 * Transport failures with no usable HTTP body (timeout, connection dropped, gateway timeout as HTTP error).
	 */
	private isTransportLayerNoResponse(error: any, statusNum: number | undefined): boolean {
		if (statusNum === HTTP_STATUS_CODES.GATEWAY_TIMEOUT) {
			return false;
		}
		if (statusNum === 0) {
			return true;
		}
		const errCode = error?.code;
		if (errCode === "ECONNABORTED" || errCode === "ETIMEDOUT" || errCode === "ERR_NETWORK") {
			return true;
		}
		const msg = String(error?.message ?? "").toLowerCase();
		if (msg.includes("network error") || msg.includes("failed to fetch")) {
			return true;
		}
		if (statusNum === undefined && msg.includes("timeout")) {
			return true;
		}
		return false;
	}

	private resolveHttpStatusCode(error: any): number | undefined {
		const raw = error?.status;
		if (typeof raw === "number" && !Number.isNaN(raw)) {
			return raw;
		}
		if (typeof raw === "string" && raw !== "") {
			const parsed = Number.parseInt(raw, 10);
			return Number.isNaN(parsed) ? undefined : parsed;
		}
		return undefined;
	}

	/**
	 * Handle request error (non-IAM)
	 */
	private handleRequestError(error: any, option: HttpRequestOptions): void {
		BizCheckMobileLogger.error("Request error", error);
		this.handleRequestCompletion();

		const statusNum = this.resolveHttpStatusCode(error);

		if (this.isTransportLayerNoResponse(error, statusNum)) {
			NetworkServices.errorCount++;
			if (NetworkServices.errorCount <= MAX_CONCURRENT_ERROR_ALERTS) {
				DialogUtil.showAlert({
					header: "Error",
					message: "The server is not responding. Please try again later."
				});
			}
			return;
		}

		const isCriticalStatus =
			statusNum !== undefined &&
			(Object.values(HTTP_STATUS_CODES) as number[]).includes(statusNum);
		if (isCriticalStatus) {
			NetworkServices.errorCount++;
			if (NetworkServices.errorCount <= MAX_CONCURRENT_ERROR_ALERTS) {
				DialogUtil.showAlert({
					header: "Error",
					message: `${error.detailMessage || error.statusText} (${statusNum})`
				});
			}
			return;
		}

		if (option.onFailed) option.onFailed(error);
	}

	// ========================================================================
	// Token and Session Management
	// ========================================================================

	/**
	 * Refresh authentication token and retry pending requests
	 */
	private refreshTokenAndRetry(): void {
		this.iam({
			body: { grant_type: "refresh_token" },
			endPoint: "token",
			enableLoading: false,
			onSuccess: async (response) => {
				this.setLastEventTime();
				BizCheckMobileLogger.info("Token refreshed successfully", response);
				const token = BizCheckMobileProperties.get("token");
				const tokenInfo = {
					...JSON.parse(token),
					accessToken: response.access_token,
					refreshToken: response.refresh_token,
					expiredTime: response.expires_in * 1000,
				};

				const requiredFields = ["access_token", "refresh_token"];

				const hasAll = requiredFields.every(key => key in response);

				if (hasAll) {
					// all fields exist
					BizCheckMobileProperties.set("lastEventTime", new Date().getTime());
					await BizCheckMobileProperties.set("token", JSON.stringify(tokenInfo));
					this.retryPendingRequests();
				} else {
					DialogUtil.showAlert({
						header: this.localeService.translate("DAS1100000.TEXT.SECURITY_HEADER"),
						message: this.localeService.translate("DAS1100000.TEXT.SECURITY_REACTIVATE"),
						onDidDismiss: () => {
							DialogUtil.showLoading();
							this.clearSessionAndRedirect();
						}
					});
				}
			},
			onFailed: (error) => {
				this.handleRequestCompletion();
				BizCheckMobileLogger.error("refresh Token Error => ", error);
				DialogUtil.showAlert({
					header: this.localeService.translate("DAS1100000.TEXT.SECURITY_HEADER"),
					message: this.localeService.translate("DAS1100000.TEXT.SECURITY_REACTIVATE"),
					onDidDismiss: () => {
						DialogUtil.showLoading();
						this.clearSessionAndRedirect();
					}
				});
			}
		});
	}

	/**
	 * Handle session expiration by logging out user
	 */
	private handleSessionExpiration(): void {
		DialogUtil.showAlert({
			message: this.localeService.translate("DAS1100000.TEXT.SECURITY_REACTIVATE"),
			onDidDismiss: () => {
				this.iam({
					body: {},
					endPoint: "revoke-token",
					enableLoading: true,
					onSuccess: () => {
						this.clearSessionAndRedirect();
					},
					onFailed: (error) => {
						BizCheckMobileLogger.info("handle session expiration => ", error);
						this.clearSessionAndRedirect();
					}
				});
			}
		});
	}

	/**
	 * Clear user session and redirect to login
	 */
	private clearSessionAndRedirect(): void {
		BizCheckMobileFStorage.init({
			callback: (response) => {
				BizCheckMobileProperties.clear({
					callback: () => {
						BizCheckMobileLogger.info("BizCheckMobileFStorage => ", response);
						if (!BizCheckMobileDevice.isApp()) {
							for (const element of Object.keys(response)) {
								response[element] = JSON.stringify(response[element]);
							}
						}
						BizCheckMobileProperties.set("appTheme", JSON.parse(response["appTheme"] || "{}"));
						BizCheckMobileProperties.set("app_subdomain", JSON.parse(response["app_subdomain"] || ""));
						BizCheckMobileProperties.set("languageReady", true);
						BizCheckMobileProperties.set("languageCode", JSON.parse(response["languageCode"] || "01"));
						BizCheckMobileProperties.set("alreadyConfirmTC", JSON.parse(response["alreadyConfirmTC"] || "true"));
						BizCheckMobileProperties.set("i18n", JSON.parse(response["i18n"]) || "en");
						DialogUtil.closeAllModals();
						DialogUtil.closeLoading();
						DialogUtil.closeAllDialogs();
						DialogUtil.closeAllLoadings();
						DialogUtil.closeAllToasts();
						DialogUtil.closeAllAlerts();
						this.routerService.backToRoot("/LOG1000000");
					}
				});
			}
		});
	}

	// ========================================================================
	// App Theme
	// ========================================================================

	/**
	 * Fetch theme configuration from native app
	 */
	private fetchNativeAppTheme(
		subdomain: string,
		resolve: (value: any) => void
	): void {
		const url = `${import.meta.env.VITE_SERVER_PROTOCOL}://${subdomain ? subdomain + "." : ""}${import.meta.env.VITE_SERVER_DOMAIN}/tenants/${subdomain}/app-theme.json`;

		BizCheckMobileApp.callPlugin({
			pluginKey: "REQUEST_HTTP",
			params: {
				url,
				method: "GET",
				headers: AppConfig.network.headers,
				body: {},
				timeout: 120,
				progressEnable: false,
			},
			callback: (response: any) => {
				resolve(response);
			}
		});
	}

	/**
	 * Fetch theme configuration from web
	 */
	private fetchWebAppTheme(
		subdomain: string,
		resolve: (value: any) => void,
		reject: (reason?: any) => void
	): void {
		const url = `/alias-server/tenants/${subdomain}/app-theme.json`;
		const options = this.httpNetwork.getHttpOptions({ method: "GET" });
		options.headers = { "X-Subdomain": subdomain };

		BizCheckMobileNetwork.requestHttp({
			url,
			httpOptions: options,
			timeout: 120,
			method: "GET"
		})
			.then((response) => {
				resolve({ response_data: response });
			})
			.catch((error) => {
				BizCheckMobileLogger.error("Failed to fetch app theme", error);
				reject(error);
			});
	}

	// ========================================================================
	// Request Queue Management
	// ========================================================================

	/**
	 * Add request to queue and execute
	 */
	private enqueueRequest(key: string, execute: () => void): void {

		if (!IAM_OAUTH_ENDPOINTS.includes(key as any) && !IAM_AUTH_ENDPOINTS.includes(key as any)) {
			NetworkServices.requestQueue.set(key, { execute, status: "PENDING" });
		}

		execute();
	}

	/**
	 * Update queue entry status
	 */
	private updateQueueStatus(key: string, status: "PENDING" | "ERROR" | "SUCCESS"): void {
		for (const [mapKey, entry] of NetworkServices.requestQueue) {
			if (mapKey === key) {
				entry.status = status;
			}
		}
	}

	/**
	 * Retry all pending requests in queue
	 */
	private retryPendingRequests() {
		for (const [, entry] of NetworkServices.requestQueue) {
			BizCheckMobileLogger.info("requestQueue => ", entry);
			if (entry.status === "PENDING") {
				entry.execute();
			}
		}
	}

	// ========================================================================
	// Loading State Management
	// ========================================================================

	/**
	 * Mark request as complete and close loading if all requests are done
	 */
	private handleRequestCompletion(): void {

		if (this.activeRequestCount > 0) {
			this.activeRequestCount--;

			if (this.activeRequestCount === 0) {
				setTimeout(() => {
					this.closeLoading();
				}, 150);
			}
		}
	}

	/**
	 * Close loading dialog
	 */
	private closeLoading(): void {
		DialogUtil.closeLoading();
	}
}

// ============================================================================
// Request Options Interface
// ============================================================================

/**
 * Configuration options for HTTP requests
 */
export interface HttpRequestOptions {
	/** Callback on successful response */
	onSuccess: (response: Record<string, any>) => void;

	/** Callback on failed response */
	onFailed?: (error: Record<string, any>) => void;

	/** Show loading indicator */
	enableLoading?: boolean;

	/** Cache request if offline */
	saveCache?: boolean;

	/** Use cached response if available (snapshot) */
	snapshot?: boolean;

	/** Cache keys to remove before executing request */
	removeCacheKeys?: string[];

	/** Additional data options for request handling */
	dataOpt?: Record<string, any>;

	/** Request body/payload */
	body: Record<string, any>;

	/** Use mock data instead of real API */
	isMock?: boolean;

	/** Request type identifier */
	transactionType?: "01" | "03";

	transactionCategory?: "PPR" | "VTR" | "CTH" | "CID" | "CIC" | "LAN";

	/** IAM endpoint name */
	endPoint?: string;

	allowSaveOffline?: boolean;

	filePaths?: string[],

	fieldName?: string,

	idOfflineData?: number,

	multipart?: boolean,

	multipartFieldName?: string[],

	multipartFilePaths?: { [key: string]: { paths: string[] } },

	targetFieldMapFileID?: string[]
	/** Customer KeyID */
	KeyID?: string;
	isHaptic?: boolean;
}

/**
 * Generic request options with type safety
 */
export interface RequestOptions<TRequest = Record<string, any>, TResponse = Record<string, any>> {
	/** Callback on successful response */
	onSuccess: (response: TResponse) => void;

	/** Callback on failed response */
	onFailed?: (error: Record<string, any>) => void;

	/** Show loading indicator */
	enableLoading?: boolean;

	/** Cache request if offline */
	saveCache?: boolean;

	/** Use cached response if available*/
	snapshot?: boolean;

	/** Additional data options for request handling */
	dataOpt?: Record<string, any>;

	/** Cache keys to remove before executing request */
	removeCacheKeys?: string[];

	/** Request body */
	body: TRequest;

	/** Use mock data */
	isMock?: boolean;

	/** Request type identifier */
	transactionType?: "01" | "03";

	transactionCategory?: "PPR" | "VTR" | "CTH" | "CID" | "CIC" | "LAN";

	/** Endpoint name */
	endPoint?: string;

	allowSaveOffline?: boolean;

	filePaths?: any[];

	fieldName?: string;

	idOfflineData?: number;

	multipart?: boolean;

	multipartFieldName?: string[];

	multipartFilePaths?: { [key: string]: { paths: string[] } };

	targetFieldMapFileID?: string[];

	/** Customer KeyID */
	KeyID?: string;

	isHaptic?: boolean;
}
