/* eslint-disable camelcase */
import i18n from "@/locale/i18n";
import BizCheckMobileNetwork from "../bizcheckmobile/bizcheckmobile-network";
import BizCheckMobileLocale from "../bizcheckmobile/bizcheckmobile-locale";
import BizCheckMobileApp from "../bizcheckmobile/bizcheckmobile-app";
import BizCheckMobileProperties from "../bizcheckmobile/bizcheckmobile-properties";
import { PROPERTIES_KEY } from "../enum/properties";

/**
 * @author Rethysen
 * @namespace LocaleService
 */
export default class LocaleService {
    private static instance: LocaleService | null = null;

    // Private constructor to prevent direct instantiation
    private constructor() { }

    // Get the singleton instance
    static getInstance(): LocaleService {
        this.instance ??= new LocaleService();
        return this.instance;
    }
    /**
     * translate message with keys
     * @author Rethysen - Latest Modified by Chanthou
     * @param key
     * @returns
     * @example
     * LocaleService.getInstance().translate("COMMON.BUTTON.OK") => Okay
     */
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
     * change translate message with keys
     * @author Rethysen
     * @param newLocaleCd - new locale code for update
     * @example
     * LocaleService.getInstance().changeLocale("km")
     */
    // changeLocale(newLocaleCd: string) {
    //     if (i18n.global.locale !== newLocaleCd) {
    //         (i18n.global.locale as any)["value"] = newLocaleCd.split("-")[0];
    //         BizCheckMobileNetwork.changeLocale(newLocaleCd);
    //         BizCheckMobileLocale.setLocale(newLocaleCd);
    //         BizCheckMobileApp.callPlugIn("NOTIFY_LANGUAGE_PLUGIN", {
    //             param: {
    //                 language_code: newLocaleCd
    //             }
    //         });
    //     }
    // }

    /**
     * initialize translate message
     * @author Rethysen
     * @namespace initLocale
     * @example
     * LocaleService.getInstance().initLocale()
     */
    initLocale() {
        let languageCode = BizCheckMobileProperties.get(PROPERTIES_KEY.I18N);

        if (languageCode === null || languageCode === undefined || languageCode === "") languageCode = "en-US";

        (i18n.global.locale as any)["value"] = languageCode.split("-")[0];

        BizCheckMobileLocale.setLocale(languageCode.split("-")[0]);

    }

    /**
     * Get translate message key
     * @author Rethysen
     * @namespace getLocale - new locale code for update
     * @example
     * LocaleService.getInstance().getLocale()
     */
    getLocale() {
        let locale = BizCheckMobileProperties.get(PROPERTIES_KEY.I18N);
        if (locale === null || locale === undefined || locale === "") locale = "en-US";
        return locale.split("-")[0];
    }
}
