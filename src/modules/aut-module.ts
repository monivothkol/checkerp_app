/* eslint-disable no-unused-vars */
import { AUT10000GoogleRequest, AUT10000GoogleResponse, AUT10000Request, AUT10000Response } from "@/interfaces/AUT/AUT10000";
import AutAPI from "@/services/api/aut-api";
import { RequestOptions } from "@/services/network-servies";
import { mergeToken, setToken } from "@/services/token-store";
import { BizCheckMobileLogger, BizCheckMobileProperties } from "@/shared/bizcheckmobile";

export default class AuthModule {
	private static instance: AuthModule;
	private autAPI: AutAPI;

	private constructor() {
		this.autAPI = AutAPI.getInstance();
	}

	static getInstance(): AuthModule {
		if (!AuthModule.instance) {
			AuthModule.instance = new AuthModule();
		}
		return AuthModule.instance;
	}

	/** AUT10000 - Login */
	login(options: RequestOptions<AUT10000Request, AUT10000Response>) {
		this.autAPI.login({
			body: options.body,
			enableLoading: options.enableLoading,
			removeCacheKeys: options.removeCacheKeys ?? [],
			saveCache: options.saveCache,
			onSuccess: (response) => {
				const result = response as AUT10000Response;
				// NetworkServices delivers the response payload directly; keep
				// the old { data } wrapper shape working too just in case.
				const payload: any = (result as any)?.data ?? result;
				if (payload?.accessToken) {
					// token-store is the single source of truth: encrypted at rest,
					// in-memory cache for the Bearer header on every request.
					void setToken(payload);
					BizCheckMobileProperties.set("alreadyLogin", true);
				}
				options.onSuccess(result);
			},
			onFailed: (error) => {
				BizCheckMobileLogger.error("AuthModule.login failed", error);
				options.onFailed && options.onFailed(error);
			}
		});
	}

	/**
	 * AUT12000 - Silently refresh the access token using the stored refresh
	 * token. On success the rotated { accessToken, refreshToken } is merged back
	 * into the stored "token" (keeping userId/userName), so the next request
	 * carries a fresh Bearer token.
	 */
	refresh(options: RequestOptions<{ refreshToken: string }, AUT10000Response>) {
		this.autAPI.refresh({
			body: options.body,
			enableLoading: options.enableLoading ?? false,
			removeCacheKeys: options.removeCacheKeys ?? [],
			saveCache: false,
			onSuccess: (response) => {
				const result = response as AUT10000Response;
				const payload: any = (result as any)?.data ?? result;
				if (payload?.accessToken) {
					void mergeToken({
						accessToken: payload.accessToken,
						...(payload.refreshToken ? { refreshToken: payload.refreshToken } : {})
					});
					BizCheckMobileProperties.set("alreadyLogin", true);
				}
				options.onSuccess(result);
			},
			onFailed: (error) => {
				BizCheckMobileLogger.error("AuthModule.refresh failed", error);
				options.onFailed && options.onFailed(error);
			}
		});
	}

	/** AUT10000 - Login with Google */
	loginWithGoogle(options: RequestOptions<AUT10000GoogleRequest, AUT10000GoogleResponse>) {
		this.autAPI.loginWithGoogle({
			body: options.body,
			enableLoading: options.enableLoading,
			removeCacheKeys: options.removeCacheKeys ?? [],
			saveCache: options.saveCache,
			onSuccess: (response) => {
				const result = response as AUT10000GoogleResponse;
				if (result.data?.accessToken) {
					BizCheckMobileProperties.set("alreadyLogin", true);
				}
				options.onSuccess(result);
			},
			onFailed: (error) => {
				BizCheckMobileLogger.error("AuthModule.loginWithGoogle failed", error);
				options.onFailed && options.onFailed(error);
			}
		});
	}
}
