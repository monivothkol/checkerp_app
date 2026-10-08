import { defineStore } from "pinia";
import DataStorage from "@/core/utilities/data-storage";
import POP from "@/core/utilities/pop";
import { clearSession, ensureAuthenticated, getTenantContext, setSubdomain, validateSubdomain } from "@/core/config/tenant-nav";
import { clearToken, getTokenSync, setToken } from "@/services/token-store";
import Login from "@/services/api/AUT/login";
import Logout from "@/services/api/AUT/logout";
import RetreiveMenuListByUser from "@/services/api/COMMON/retreiveMenuListByUser";
import type { AUT10000I01Response, UserInfo } from "@/models/COMMON/AUT10000";
import type { MenuInfo } from "@/models/COMMON/UAC02000I01";

/** silent: the network layer already showed a "Connection Issue" alert. */
export type LoginResult = { ok: true } | { ok: false; message: string; code?: string; silent?: boolean };

/** AUT10000 — sign in (company + username + password), keep the session and the user's menu; sign out. */
export const AUT10000Store = defineStore("AUT10000Store", {
	state: () => ({
		subdomain: getTenantContext().subdomain,
		username: "",
		password: "",
		submitting: false,
		menuList: [] as MenuInfo[]
	}),
	actions: {
		async restore(): Promise<void> {
			this.subdomain = getTenantContext().subdomain;
			this.username = (await DataStorage.get({ key: "RememberUserID" })) || "";
			this.password = "";
			await this.restoreMenu();
		},

		async restoreMenu(): Promise<void> {
			try {
				this.menuList = JSON.parse((await DataStorage.get({ key: "MenuList" })) || "[]");
			} catch {
				this.menuList = [];
			}
		},

		async login(): Promise<LoginResult> {
			if (this.submitting) return { ok: false, message: "", silent: true };
			this.submitting = true;
			try {
				return await this.doLogin();
			} finally {
				this.submitting = false;
			}
		},

		async doLogin(): Promise<LoginResult> {
			// Field accepts subdomain or company code; CMM01000I01 resolves either to the real subdomain.
			const company = await validateSubdomain(this.subdomain.trim().toLowerCase());
			if (!company.isValid) return { ok: false, message: "COMPANY_NOT_FOUND" };
			const subdomain = (company.subdomain || this.subdomain).trim().toLowerCase();
			setSubdomain(subdomain);

			const res = await new Promise<AUT10000I01Response | { message: string; code?: string }>((resolve) =>
				Login.getInstance().request({
					dataBody: { subdomain, username: this.username.trim(), password: this.password, deviceName: navigator.platform || "App", deviceType: "MOBILE" },
					enableLoading: true,
					listener: { onSuccess: resolve, onFail: (e) => resolve({ message: e?.message ?? "", code: e?.code }) }
				}));
			if (!("accessToken" in res)) return { ok: false, ...res, silent: POP.isTransportError(res) };

			await setToken({ ...res });
			const userInfo: UserInfo = {
				userId: res.userId,
				userName: res.userName,
				username: res.username,
				companyId: res.companyId,
				companyCode: res.companyCode,
				companyName: res.companyName,
				companyLogoUrl: res.companyLogoUrl,
				assignedInventoryIds: res.assignedInventoryIds ?? []
			};
			DataStorage.set({ key: "userInfo", value: JSON.stringify(userInfo) });
			DataStorage.set({ key: "Priority", value: "COMMON" });
			DataStorage.set({ key: "RememberUserID", value: res.username });
			this.password = "";
			await this.loadMenu(res.userId);
			return { ok: true };
		},

		/** UAC02000I01 — the effective menu (package ∩ role); an empty menu still lets the user in. */
		loadMenu(userId: string): Promise<void> {
			return new Promise((resolve) =>
				RetreiveMenuListByUser.getInstance().request({
					dataBody: { userId },
					listener: {
						onSuccess: (r) => {
							this.menuList = r.list ?? [];
							DataStorage.set({ key: "MenuList", value: this.menuList });
							resolve();
						},
						onFail: () => resolve()
					}
				}));
		},

		/** AUT10000I03 revokes this device's session; local state is cleared whatever the result. */
		async logout(): Promise<void> {
			// Rotate an expired access token first, so the refresh token sent is the current one.
			await ensureAuthenticated();
			const refreshToken = getTokenSync()?.refreshToken;
			if (refreshToken) {
				await new Promise<void>((resolve) =>
					Logout.getInstance().request({ dataBody: { refreshToken }, listener: { onSuccess: () => resolve(), onFail: () => resolve() } }));
			}
			const remembered = await DataStorage.get({ key: "RememberUserID" });
			await clearToken();
			await clearSession().catch(() => undefined);
			if (remembered) DataStorage.set({ key: "RememberUserID", value: remembered });
			this.menuList = [];
		}
	}
});
