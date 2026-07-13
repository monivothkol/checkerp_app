import { BizCheckMobileApp, BizCheckMobileDevice, BizCheckMobileLogger, BizCheckMobileProperties } from "@/shared/bizcheckmobile";
import NetworkServices from "./network-servies";

/** Response shape used by callers (e.g. login flow). */
export interface PushNotificationResult {
	header: { result: boolean };
}

export interface RegisterPushNotificationParams {
	userId: string;
	callback: (response: PushNotificationResult) => void;
}

const REGISTER_TR_CODE = "NTC04001A01"; // change adapter PUM01001A01 => NTC04001A01

export default class PushNotificationService {
	private readonly networkService: NetworkServices;

	constructor(networkService?: NetworkServices) {
		this.networkService = networkService ?? new NetworkServices();
	}

	/**
	 * Request OS notification permission via native plugin.
	 * Forwards plugin outcome when present; otherwise defaults to success for backward compatibility.
	 */
	pushNotificationPermission(type: string, callback: (response: PushNotificationResult) => void): void {
		BizCheckMobileApp.callPlugin({
			pluginKey: "NOTIFICATION_PERMISSION_PLUGIN",
			params: {
				header: {
					result: false,
					error_code: "",
					error_message: "",
				},
				body: {
					type,
				},
			},
			callback: (result: any) => {
				BizCheckMobileLogger.log("pushNotificationPermission ==== ", result);
				const headerResult = result?.header?.result ?? result?.result;
				const ok = headerResult === undefined ? true : Boolean(headerResult);
				callback({ header: { result: ok } });
			},
		});
	}

	/**
	 * Registers device push token with backend (native only). Skips when already registered for same user with push enabled.
	 */
	registerPushNotification(params: RegisterPushNotificationParams): void {
		if (!BizCheckMobileDevice.isApp()) {
			params.callback({ header: { result: true } });
			return;
		}

		if (this.isAlreadyRegisteredForUser(params.userId)) {
			BizCheckMobileLogger.log("userRegisterPushNotification already registered");
			params.callback({ header: { result: true } });
			return;
		}

		const deviceInfo = BizCheckMobileDevice.getInfo();
		BizCheckMobileLogger.log("deviceInfo ==== ", deviceInfo);
		const appVersion = `${deviceInfo.app_major_version}.${deviceInfo.app_minor_version}.${deviceInfo.app_build_version}`;

		this.networkService.request(REGISTER_TR_CODE, {
			body: {
				pushKey: deviceInfo.push_key,
				appName: "LOSAPP",
				appVersion,
				deviceOsType: deviceInfo.device_os_type,
				deviceOsVersion: deviceInfo.device_os_version,
				deviceUid: deviceInfo.device_uuid,
				deviceType: deviceInfo.device_type,
				deviceModel: deviceInfo.model || "",
				pushProviderType: deviceInfo.push_provider_type,
				carrierCode: deviceInfo.carrier_code || "0000",
				locale: BizCheckMobileProperties.get("i18n") || "en",
				multiDeviceFlag: deviceInfo.release_flag,
				userId: params.userId,
			},
			onSuccess: (response: any) => {
				BizCheckMobileProperties.set("userRegisterPushNotification", params.userId);
				BizCheckMobileProperties.set("pushNotification", true);
				BizCheckMobileLogger.log("registerPushNotification response : ", response);
				params.callback({ header: { result: true } });
			},
			onFailed: (error: any) => {
				BizCheckMobileLogger.log("registerPushNotification error : ", error);
				BizCheckMobileProperties.set("pushNotification", false);
				params.callback({ header: { result: false } });
			},
		});
	}

	/** Same user re-login with push flag still on — skip duplicate register call. */
	private isAlreadyRegisteredForUser(userId: string): boolean {
		const registeredUserId = BizCheckMobileProperties.get("userRegisterPushNotification");
		if (!registeredUserId || registeredUserId !== userId) {
			return false;
		}
		return this.readPushNotificationEnabled();
	}

	/**
	 * `pushNotification` may be stored as boolean or JSON string (e.g. "true"/"false") depending on platform/storage.
	 */
	private readPushNotificationEnabled(): boolean {
		const raw = BizCheckMobileProperties.get("pushNotification");
		if (raw === true || raw === "true") {
			return true;
		}
		if (raw === false || raw === "false" || raw == null || raw === "") {
			return false;
		}
		try {
			return JSON.parse(String(raw)) === true;
		} catch {
			return false;
		}
	}
}
