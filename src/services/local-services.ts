import { LANGUAGE_CODE_MAP, LOCALE_CODE_MAP } from "@/constant/common";
import i18n from "@/locale/i18n";
import { BizCheckMobileDevice, BizCheckMobileLogger, BizCheckMobileProperties } from "@/shared/bizcheckmobile";
import { ref } from "vue";

export default class LocalServices {
	public static initLocalServices(): void {
		const languageI18n = ref(BizCheckMobileProperties.get("i18n") || "En");
		if (!languageI18n.value) {
			BizCheckMobileLogger.log("language i18n is not set, setting default language");
			const deviceInfo = BizCheckMobileDevice.getInfo();
			if (deviceInfo.locale && deviceInfo.locale !== "en-US") {
				BizCheckMobileProperties.set("locale", deviceInfo.locale);
				BizCheckMobileProperties.set("i18n", deviceInfo.locale.split("-")[0]);
				languageI18n.value = deviceInfo.locale.split("-")[0];
			} else {
				BizCheckMobileProperties.set("locale", "en-US");
				BizCheckMobileProperties.set("i18n", "En");
				languageI18n.value = "En";
			}
		}

		// Apply locale immediately
		try {
			(i18n.global as any).locale.value = new String(languageI18n.value).toLocaleLowerCase();
		} catch (e) {
			BizCheckMobileLogger.error("Error setting locale:", e);
		}
		document.documentElement.setAttribute("lang", languageI18n.value);
	}


	public static setLanguageI18nByCode(code: string): void {
		const languageI18n = LANGUAGE_CODE_MAP[code as keyof typeof LANGUAGE_CODE_MAP];
		const locale = LOCALE_CODE_MAP[code as keyof typeof LANGUAGE_CODE_MAP];
		try {
			(i18n.global as any).locale.value = new String(languageI18n).toLocaleLowerCase();
			BizCheckMobileProperties.set("locale", locale);
			BizCheckMobileProperties.set("i18n", languageI18n);
			BizCheckMobileProperties.set("languageCode", code);
		} catch (e) {
			BizCheckMobileLogger.error("Error setting locale:", e);
		}
		document.documentElement.setAttribute("lang", languageI18n);
	}

	translate(key: string, custom: Record<string, any> = {}): string {
		try {
			const translation = Object.keys(custom).length === 0
				? i18n.global.t(key)
				: i18n.global.t(key, custom);
			return translation;
		} catch (error: any) {
			console.error("Translation error:", error.message);
			return key;
		}
	}

	/**
	 * Get translate message key
	 * @author Rethysen
	 * @namespace getLocale - new locale code for update
	 * @example
	 * LocaleService.getInstance().getLocale()
	 */
	getLocale() {
		let locale = BizCheckMobileProperties.get("i18n");
		if (locale === null || locale === undefined || locale === "") locale = "en";
		return locale.split("-")[0];
	}

}
