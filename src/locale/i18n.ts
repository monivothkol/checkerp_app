import { createI18n } from "vue-i18n";
import type { I18nOptions } from "vue-i18n";
import en from "./messages/en.json";
import km from "./messages/km.json";
import webEn from "./messages/web-en.json";
import webKm from "./messages/web-km.json";

/**
 * App messages + checkerp_web's per-screen messages (web-*.json, copied from the web so the
 * shared screens use the same keys, e.g. SAL11000.*). Deep-merged: the app's own keys win
 * where both define the same leaf (only COMMON overlaps).
 */
type Messages = Record<string, unknown>;

function merge(base: Messages, extra: Messages): Messages {
	const out: Messages = { ...base };
	for (const [key, value] of Object.entries(extra)) {
		const cur = out[key];
		if (cur && typeof cur === "object" && value && typeof value === "object" && !Array.isArray(value)) {
			out[key] = merge(cur as Messages, value as Messages);
		} else if (cur === undefined) {
			out[key] = value;
		}
	}
	return out;
}

/**
 * App-only keys for ported screens, one file per module so screens can be added in parallel:
 * messages/app/<MOD>.en.json + <MOD>.km.json. They win over the web keys like en/km.json do.
 */
const appFiles = import.meta.glob<Messages>("./messages/app/*.json", { eager: true, import: "default" });
function appMessages(lang: "en" | "km"): Messages {
	return Object.entries(appFiles)
		.filter(([file]) => file.endsWith(`.${lang}.json`))
		.reduce((acc, [, msgs]) => merge(acc, msgs), {} as Messages);
}

const i18nOptions: I18nOptions = {
	legacy: false,
	globalInjection: true,
	warnHtmlMessage: false,
	locale: "en",
	fallbackLocale: "en",
	messages: {
		en: merge(merge(en as Messages, appMessages("en")), webEn as Messages),
		km: merge(merge(km as Messages, appMessages("km")), webKm as Messages)
	} as I18nOptions["messages"]
};

export default createI18n(i18nOptions);
