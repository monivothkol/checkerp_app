import { createI18n } from "vue-i18n";
import type { I18nOptions } from "vue-i18n";
import en from "./messages/en.json";
import km from "./messages/km.json";

const i18nOptions: I18nOptions = {
	legacy: false,
	globalInjection: true,
	warnHtmlMessage: false,
	locale: "en",
	fallbackLocale: "en",
	messages: {
		en: {
			...en
		},
		km: {
			...km
		}
	}
};

export default createI18n(i18nOptions);
