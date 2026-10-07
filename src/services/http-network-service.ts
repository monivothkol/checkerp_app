import { BizCheckMobileDevice, BizCheckMobileLogger, BizCheckMobileProperties } from "@/shared/bizcheckmobile";
import { clearToken, getTokenSync, mergeToken } from "@/services/token-store";
import i18n from "@/locale/i18n";
import POP from "@/core/utilities/pop";

/**
 * warehouse_v2 trCode client with the same contract as checkerp_web's HttpNetworkService,
 * so the web's services/api/** classes run unchanged in the app.
 *
 *   POST {server}/api/{trCode}   body { header, payload }   ->   { header: { messageInfo }, payload }
 *
 * Resolves with the payload, rejects with { code, message } (the caller shows business errors).
 * Transport failures (offline, timeout, HTTP 4xx/5xx without our envelope) also raise one
 * "Connection Issue" alert, as on the web. An expired access token is rotated once via
 * AUT10000I02 and the request retried.
 *
 * Replaces the legacy DBCS client (services/network-servies.ts + modules/*-module.ts +
 * services/api/*-api.ts); those stay only until the screens that still import them are ported.
 */

export interface HttpRequestParam {
	trCode: string;
	reqBody: Record<string, any>;
	stateProps?: Record<string, any>;
	loadingBtn?: string[];
	enableLoading?: boolean;
	/** Extra request headers, e.g. Idempotency-Key on create trCodes */
	headers?: Record<string, string>;
	dataFormat?: unknown;
	/** Optional callbacks, as on the web; the returned promise carries the same outcome. */
	listener?: { onSuccess?: (payload: any) => void; onFail?: (error: Record<string, any>) => void };
}

export interface HttpError {
	code: string;
	message: string;
}

interface MessageInfo { result: boolean; code: string; message: string; detailMessage?: string }

/** Callable without a session: login, refresh, register, subdomain check. */
const PUBLIC_TR_CODES = new Set(["AUT10000I01", "AUT10000I02", "AUT11000I01", "CMM01000I01"]);
const REFRESH_TR_CODE = "AUT10000I02";
const TIMEOUT_MS = 60_000;
/** Don't stack "Connection Issue" alerts when several requests fail together. */
const CONNECTION_ALERT_GAP_MS = 5_000;

const t = (key: string) => i18n.global.t(`POP.${key}`);

function apiUrl(trCode: string): string {
	const env = import.meta.env;
	if (BizCheckMobileDevice.isApp()) {
		const sub = BizCheckMobileProperties.get("app_subdomain");
		return `${env.VITE_SERVER_PROTOCOL}://${sub ? sub + "." : ""}${env.VITE_SERVER_DOMAIN}/${env.VITE_SERVER_CONTEXT}/${trCode}`;
	}
	return `/alias-server/${env.VITE_SERVER_CONTEXT}/${trCode}`;
}

export default class HttpNetworkService {
	private static instance: HttpNetworkService;
	private static refreshing: Promise<boolean> | null = null;
	private static loadingCount = 0;
	private static lastConnectionAlert = 0;

	static getInstance(): HttpNetworkService {
		if (!this.instance) this.instance = new HttpNetworkService();
		return this.instance;
	}

	request(params: HttpRequestParam): Promise<any> {
		if (!params.trCode || !params.reqBody) {
			return Promise.reject({ code: "INVALID_REQUEST", message: "trCode and reqBody are required" } as HttpError);
		}
		this.setButtons(params, true);
		if (params.enableLoading) this.showLoading();
		const promise = this.send(params, true).finally(() => {
			this.setButtons(params, false);
			if (params.enableLoading) this.hideLoading();
		});
		if (params.listener) {
			promise.then((p) => params.listener?.onSuccess?.(p), (e) => params.listener?.onFail?.(e));
		}
		return promise;
	}

	private async send(params: HttpRequestParam, canRefresh: boolean): Promise<any> {
		const token = getTokenSync();
		const headers: Record<string, string> = { "Content-Type": "application/json", ...(params.headers ?? {}) };
		if (token?.accessToken && !PUBLIC_TR_CODES.has(params.trCode)) {
			headers.Authorization = `Bearer ${token.accessToken}`;
		}
		// screenId = the trCode's screen (e.g. SAL11000I01 -> SAL11000); the backend only logs it.
		const envelope = { header: { trCode: params.trCode, screenId: params.trCode.slice(0, 8) }, payload: params.reqBody };

		let res: Response;
		try {
			res = await fetch(apiUrl(params.trCode), {
				method: "POST",
				headers,
				body: JSON.stringify(envelope),
				signal: AbortSignal.timeout(TIMEOUT_MS)
			});
		} catch (error) {
			BizCheckMobileLogger.error(`${params.trCode} transport error`, error);
			const timedOut = (error as Error)?.name === "TimeoutError";
			throw this.transportError(timedOut ? "TIMEOUT" : "NETWORK_ERROR", t(timedOut ? "TIMEOUT_MSG" : "CONNECTION_MSG"));
		}

		const isJson = (res.headers.get("content-type") ?? "").includes("application/json");
		const body = isJson ? await res.json().catch(() => null) as { header?: { messageInfo?: MessageInfo }; payload?: any } | null : null;
		const info = body?.header?.messageInfo;
		if (!info) {
			// nginx 502/504 page, 429, empty body: not our envelope.
			throw this.transportError(`HTTP_${res.status}`, t(res.status >= 500 ? "SERVER_MSG" : "CONNECTION_MSG"));
		}
		if (info.result) return body?.payload ?? {};

		if (info.code === "UNAUTHORIZED" && canRefresh && !PUBLIC_TR_CODES.has(params.trCode) && (await this.refresh())) {
			return this.send(params, false);
		}
		throw { code: info.code ?? "SYSTEM_ERROR", message: info.message ?? "Request failed" } as HttpError;
	}

	/** One rotation in flight at a time; false (and session cleared) when it cannot be renewed. */
	refresh(): Promise<boolean> {
		if (HttpNetworkService.refreshing) return HttpNetworkService.refreshing;
		const refreshToken = getTokenSync()?.refreshToken;
		HttpNetworkService.refreshing = (async () => {
			if (!refreshToken) return false;
			try {
				const p = await this.send({ trCode: REFRESH_TR_CODE, reqBody: { refreshToken } }, false);
				await mergeToken({ accessToken: p.accessToken, refreshToken: p.refreshToken });
				return true;
			} catch {
				await clearToken();
				return false;
			}
		})().finally(() => { HttpNetworkService.refreshing = null; });
		return HttpNetworkService.refreshing;
	}

	/** Transport-level failure: alert once (the web shows the same "Connection Issue"), then reject. */
	private transportError(code: string, message: string): HttpError {
		const now = Date.now();
		if (now - HttpNetworkService.lastConnectionAlert > CONNECTION_ALERT_GAP_MS) {
			HttpNetworkService.lastConnectionAlert = now;
			POP.alert({ status: "error", title: t("CONNECTION_TITLE"), content: message, errorCode: code, connection: true });
		}
		return { code, message };
	}

	private setButtons(params: HttpRequestParam, on: boolean): void {
		if (!params.stateProps || !params.loadingBtn) return;
		for (const btn of params.loadingBtn) params.stateProps[btn] = on;
	}

	private showLoading(): void {
		if (HttpNetworkService.loadingCount++ === 0) POP.loading();
	}

	private hideLoading(): void {
		if (--HttpNetworkService.loadingCount <= 0) {
			HttpNetworkService.loadingCount = 0;
			POP.closeLoading();
		}
	}
}
