import { BizCheckMobileApp, BizCheckMobileLogger } from "@/shared/bizcheckmobile";
import type { RouteLocationNormalized } from "vue-router";

// Talks to native Firebase Crashlytics through BizCheckMobile plugin key.
const PLUGIN_KEY = "FIREBASE_CRASHLYTICS_PLUGIN" as const;

// Native side expects { key, value } pairs here.
type CrashlyticsCustomKey = { key: string; value: string };

function invoke(body: Record<string, unknown>, afterResponse?: (response: unknown) => void) {
	BizCheckMobileLogger.info("Crashlytics plugin", body);
	BizCheckMobileApp.callPlugin({
		pluginKey: PLUGIN_KEY,
		params: {
			header: {
				result: false,
				// eslint-disable-next-line camelcase
				error_code: "",
				// eslint-disable-next-line camelcase
				error_message: "",
			},
			body,
		},
		callback: (response) => {
			if (afterResponse) {
				afterResponse(response);
			} else {
				BizCheckMobileLogger.info("Crashlytics plugin response", response);
			}
		},
	});
}

// Used from set-module (user id), router (screen), network (API + non-fatals).
export class CrashlyticsPluginService {
	static setUserId(userId: string) {
		invoke({
			// eslint-disable-next-line camelcase
			user_id: userId || "",
		});
	}

	static log(message: string) {
		if (!message) return;
		invoke({ log: message });
	}

	static logApiCall(trCode: string) {
		this.log(`Call API: ${trCode}`);
	}

	static logScreenFromRoute(to: RouteLocationNormalized) {
		const name = to.name != null ? String(to.name) : "unnamed";
		this.log(`Open screen: ${name} (${to.fullPath})`);
	}

	static recordNonFatal(text: string, type: string, customKeys: CrashlyticsCustomKey[] = []) {
		if (!text || !type) return;
		invoke(
			{
				text,
				type,
				// eslint-disable-next-line camelcase
				custom_keys: customKeys,
			},
		);
	}
}
