/* eslint-disable camelcase */

import { PROPERTIES_KEY } from "../enum/properties";
import BizCheckMobileDevice from "./bizcheckmobile-device";
import BizCheckMobileLogger from "./bizcheckmobile-logger";
import BizCheckMobileProperties from "./bizcheckmobile-properties";


/* eslint-disable no-unused-vars */
const bizCheckMobile = window.bizCheckMobile;
class App {

    private static instance: App;

    // Private constructor to prevent direct instantiation
    private constructor() { }

    // Get the singleton instance
    static getInstance(): App {

        if (!this.instance) {
            this.instance = new App();
        }
        return this.instance;

    }

    smsRetriever(type: "register" | "unregister", callback?: (response: any) => void) {
        this.callPlugIn("SMS_RETRIEVER_PLUGIN", { param: { type, callback } });
    }

    playHaptic(param: { sound?: boolean, vibration?: boolean, positive?: boolean }) {
        this.callPlugIn("HAPTIC_PLUGIN", {
            injectBodyHeader: true,
            param: {
                sound: param.sound,
                vibration: param.vibration,
                positive: param.positive ?? true
            }
        });
    }

    openTermCondition(option: {
        title?: string,
        isTerm: boolean,
        url?: string,
        trcode: string,
        refScreenID: string,
        isBioVerify?: boolean,
        action: Array<{ text: string, type: "negative" | "positive" }>, callback: (response: any) => void
    }) {

        const deviceInfo: any = BizCheckMobileDevice.getInfo();
        this.callPlugIn("TERM_AND_CONDITION_PLUGIN", {
            injectBodyHeader: true,
            param: {
                trcode: option.trcode,
                message: {
                    header: {
                        info_text: "",
                        error_code: "",
                        error_text: "",
                        login_session_id: "",
                        message_version: "",
                        result: false,
                        trcode: option.trcode,
                        screenID: "",
                        transactionDate: "",
                        transactionID: "",
                        uuid: BizCheckMobileDevice.getUUID(),
                        languageCode: BizCheckMobileProperties.get(PROPERTIES_KEY.I18N).split("-")[0] || "en",
                        macAddress: BizCheckMobileDevice.getMacAddress(),
                        smartPhoneApplicationName: "",
                        smartPhoneApplicationVersion: `${deviceInfo.app_major_version}.${deviceInfo.app_minor_version}.${deviceInfo.app_build_version}_${deviceInfo.content_major_version}.${deviceInfo.content_minor_version}`,
                        smartPhoneFirmWareVersion: deviceInfo.os_version,
                        smartPhoneManufacturer: deviceInfo.manufacturer,
                        smartPhoneModelName: deviceInfo.model,
                        smartPhoneVersionTypeCode: this.getPhoneVersionTypeCode(deviceInfo.os_type),
                        channelTypeCode: "03"
                    },
                    body: {
                        refScreenID: option.refScreenID
                    }
                },
                url: option.url ? option.url : "",
                is_bio_verify: option.isBioVerify ? option.isBioVerify : false,
                title: option.title || "",
                is_term: option.isTerm,
                actions: option.action,
            },
            callback: option.callback
        });

    }

    openAccountReorder(option: {
        title?: string,
        isTerm: boolean,
        url?: string,
        trcode: string,
        refScreenID: string,
        isBioVerify?: boolean,
        action: Array<{ text: string, type: "negative" | "positive" }>, callback: (response: any) => void
    }) {

        this.callPlugIn("ACCOUNT_REORDER_SCREEN", {
            injectBodyHeader: true,
            param: {
                trcode: option.trcode,
                message: {
                    header: {
                        channel_type_code: "03",
                        macAddress: "emulator",
                        error_code: "",
                        error_text: "",
                        id_token: "",
                        info_text: "",
                        login_session_id: "",
                        message_version: "",
                        result: true,
                        screen_id: "",
                        language_code: "En",
                        timestamps: "",
                        trcode: option.trcode,
                        uuid: ""
                    },
                    body: {
                        refScreenID: option.refScreenID
                    }
                },
                url: option.url ? option.url : "",
                is_bio_verify: option.isBioVerify ? option.isBioVerify : false,
                title: option.title || "",
                is_term: option.isTerm,
                actions: option.action,
            },
            callback: option.callback
        });

    }

    getPhoneVersionTypeCode(deviceOSType: string): string {
        return DEVICE_OS_TYPE[deviceOSType.toUpperCase() as keyof typeof DEVICE_OS_TYPE] || "";
    }

    openCardReorder(option: {
        title?: string,
        isTerm: boolean,
        url?: string,
        trcode: string,
        refScreenID: string,
        isBioVerify?: boolean,
        action: Array<{ text: string, type: "negative" | "positive" }>, callback: (response: any) => void
    }) {

        this.callPlugIn("CARD_REORDER_SCREEN", {
            injectBodyHeader: true,
            param: {
                trcode: option.trcode,
                message: {
                    header: {
                        channel_type_code: "03",
                        macAddress: "emulator",
                        error_code: "",
                        error_text: "",
                        id_token: "",
                        info_text: "",
                        login_session_id: "",
                        message_version: "",
                        result: true,
                        screen_id: "",
                        language_code: "En",
                        timestamps: "",
                        trcode: option.trcode,
                        uuid: ""
                    },
                    body: {
                        refScreenID: option.refScreenID
                    }
                },
                url: option.url ? option.url : "",
                is_bio_verify: option.isBioVerify ? option.isBioVerify : false,
                title: option.title || "",
                is_term: option.isTerm,
                actions: option.action,
            },
            callback: option.callback
        });

    }

    fStorage(param: Partial<{ callback: (response?: any) => void }> = {}) {
        this.callPlugIn("FSTORAGE_PLUGIN", {
            callback: (response) => {
                bizCheckMobile.FStorage = response["fstorage"];
                BizCheckMobileLogger.info("FSTORAGE_PLUGIN: ", response);
                if (bizCheckMobile.FStorage["i18n"] === "") bizCheckMobile.FStorage["i18n"] = "en-US";
                if (param.callback) param.callback(response["fstorage"]);
            }
        });
    }

    isNewAppVersion() {

        if (!BizCheckMobileDevice.isApp()) return false; // if web, skip check

        const appVersion: string = BizCheckMobileDevice.isIOS() ? import.meta.env.VITE_APP_VERSION_REGULAR_IOS : import.meta.env.VITE_APP_VERSION_REGULAR_AOS;
        const requiredVers = appVersion?.split(".") || [];
        const requiredMajor = Number(requiredVers[0] ?? 0);
        const requiredMinor = Number(requiredVers[1] ?? 0);
        const requiredBuild = Number(requiredVers[2] ?? 0);
        const deviceInfo = BizCheckMobileDevice.getInfo();

        BizCheckMobileLogger.info("Device Info", deviceInfo, deviceInfo.app_major_version, deviceInfo.app_minor_version, deviceInfo.app_build_version);
        BizCheckMobileLogger.info("appVersion", requiredMajor, requiredMinor, requiredBuild);
        if (Number(deviceInfo.app_major_version) > requiredMajor) {
            return true; // No update needed
        } else if (Number(deviceInfo.app_major_version) === requiredMajor) {
            if (Number(deviceInfo.app_minor_version) > requiredMinor) {
                return true; // No update needed
            } else if (Number(deviceInfo.app_minor_version) === requiredMinor) {
                if (Number(deviceInfo.app_build_version) > requiredBuild) {
                    return true; // No update needed
                }
            }
        }

        return false; // Update needed
    }

    pickerImage(callback: (response: any) => void) {
        this.callPlugIn("IMAGE_PICKER_PLUGIN", { callback });
    }

    contactPicker(callback: (response: any) => void) {
        this.callPlugIn("CONTACT_PICKER_PLUGIN", { injectBodyHeader: true, callback });
    }

    openFileExplorer(param: { types: string[], callback: (response: any) => void }) {
        this.callPlugIn("CALL_FILE_BROWSER", {
            injectBodyHeader: false,
            param: {
                types: param.types,
                callback: (response: any) => {
                    if (param.callback) {
                        param.callback(response);
                    }
                }
            }
        });
    }

    openInAppBrowser(options: { param: { url: string, fromScreenID: string, fromScreenName: string, allowOpenExternalBrowsers?: string[], sbi_insurance_data?: {} }, callback?: (response: any) => void }) {
        this.callPlugIn("IN_APP_BROWSER_PLUGIN",
            {
                injectBodyHeader: true,
                param: {
                    url: options.param.url,
                    fromScreenID: options.param.fromScreenID,
                    fromScreenName: options.param.fromScreenName,
                    allowOpenExternalBrowsers: options.param.allowOpenExternalBrowsers || [],
                    sbi_insurance_data: options.param.sbi_insurance_data
                },
                callback(res) {
                    if (options.callback) {
                        options.callback(res);
                    }
                },
            });
    }

    callPlugIn(api: string, option: Partial<{ injectBodyHeader: boolean, param: Record<string, any>; callback: (res: any) => void }> = {}) {

        let oParam: any = {};

        if (option.injectBodyHeader) {
            oParam.body = Object.assign({}, option.param);
            oParam.header = { result: false, error_code: "", error_message: "" };
        } else {
            oParam = Object.assign({}, option.param);
        }

        if (option.callback) {
            oParam.callback = option.callback;
        }
        bizCheckMobile.gateway("ExtendsManager", "executer", { _sID: api, _oParam: oParam }, ["_sID"]);
    }

    exit() {
        bizCheckMobile.gateway("App", "exit", { _sType: "exit" });
    }

    setAppTimeout(param: { seconds: number, message?: string }) {
        bizCheckMobile.gateway("App", "requestTimeout", { _nSeconds: param.seconds, _vMessage: param.message });
    }

    kill() {
        bizCheckMobile.gateway("App", "exit", { _sType: "kill" });
    }

    restart() {
        bizCheckMobile.gateway("App", "exit", { _sType: "restart" });
    }

    setTimeout(_nSeconds: number) {
        bizCheckMobile.gateway("App", "requestTimeout", { _nSeconds });
    }

    getTimeout(callback: (res: any) => void) {
        bizCheckMobile.gateway("App", "requestTimeout", { _fCallback: callback });
    }

    hideSplash(option: Partial<{ callback: (response?: any) => void }> = {}) {
        let param = { _fCallback: function () { } };
        if (option && option.callback) {
            param._fCallback = option.callback;
        }
        bizCheckMobile.gateway("App", "hideSplash", param);
    }

    hideHomeSkeleton() {
        setTimeout(() => {
            this.callPlugIn("HOME_SKELETON_PLUGIN", { injectBodyHeader: true, param: { type: "hide" } });
        }, 100);
    }



    copyCardNo(param: { accountNo: string, ref: HTMLInputElement }) {
        this.clipboardCopy(param.accountNo, param.ref);
        // this.modalService.toast(this.localeService.translate("COMMON.LABEL.CARD_NUMBER_COPIED"), { duration: 1500, action: "success" });
    }

    copyText(param: { text: string, ref: HTMLInputElement }) {
        this.clipboardCopy(param.text, param.ref);
        // if (param.message) this.modalService.toast(param.message, { duration: 1500, action: "success" });
    }

    clipboardCopy(text: string, ref: HTMLInputElement) {
        ref.setAttribute("inputmode", "none");
        ref.value = text;
        ref.select();
        document.execCommand("copy");
    }

    setStatusBar(appearance: "light" | "dark") {
        const themeMode = BizCheckMobileProperties.get(PROPERTIES_KEY.THEME_MODE);
        if (themeMode === "easy_dark" || themeMode === "dark") appearance = "dark"; // appearance = dark text status bar is white;
        if (themeMode === "easy_light") appearance = "light"; // appearance = light text status bar is black;
        this.callPlugIn("STATUS_BAR_PLUGIN", {
            injectBodyHeader: true,
            param: {
                background_color_string: "#00000000",
                appearance
            }
        });
    }

    openNotificationPermission(type: "request" | "check" | "setting", callback: (response: any) => void) {
        this.callPlugIn("NOTIFICATION_PERMISSION_PLUGIN", {
            injectBodyHeader: true,
            param: {
                type: type,//check,request,setting
            },
            callback: callback
        });
    }

    updateWidget(param: Partial<{ callback: (response: any) => void, types?: string[] }> = {}) {
        this.callPlugIn("UPDATE_WIDGET_PLUGIN", {
            injectBodyHeader: true,
            param: {
                types: param.types
            },
            callback: (e) => {
                if (param.callback) {
                    param.callback(e);
                }
            }
        });
    }

    openMerchantDetailScreen(params: Partial<{ data: any, callback: (response: any) => void }> = {}) {
        this.callPlugIn("MERCHANT_DETAIL_SCREEN", {
            param: {
                data: params.data
            },
            callback: (response: any) => {
                BizCheckMobileLogger.log("data ", response);
                if (params.callback) params.callback(response);
            }
        });
    }

    setSafeArea() {
        const height = String(BizCheckMobileProperties.get("STATUS_BAR_HEIGHT") || "0");


        if (Number(height) === 0) {
            document.documentElement.style.setProperty("--ios-status-bar-height", "0px");
            document.documentElement.style.setProperty("--android-status-bar-height", "20px");
            document.documentElement.style.setProperty("--ion-safe-area-top", "20px");
            document.documentElement.style.setProperty("--ion-safe-area-bottom", "0px");
            document.documentElement.style.setProperty("--safeArea", "20px");
            document.documentElement.style.setProperty("--heighFixed", "80px");
            return;
        }

        if (BizCheckMobileDevice.isApp() && BizCheckMobileDevice.isIOS()) {
            document.documentElement.style.setProperty("--android-status-bar-height", "0px");
            document.documentElement.style.setProperty("--ios-status-bar-height", `${height}px`);
            document.documentElement.style.setProperty("--ion-safe-area-top", `${height}px`);
            document.documentElement.style.setProperty("--ion-safe-area-bottom", "0px");
            document.documentElement.style.setProperty("--safeArea", `${height}px`);
            document.documentElement.style.setProperty("--heighFixed", "105px");
        }

        if (BizCheckMobileDevice.isApp() && BizCheckMobileDevice.isAndroid()) {
            document.documentElement.style.setProperty("--ios-status-bar-height", "0px");
            document.documentElement.style.setProperty("--android-status-bar-height", "0px");
            document.documentElement.style.setProperty("--ion-safe-area-top", "0px");
            document.documentElement.style.setProperty("--ion-safe-area-bottom", "0px");
            document.documentElement.style.setProperty("--safeArea", `${height}px`);
            document.documentElement.style.setProperty("--heighFixed", "60px");
        }
    }
    getAppVersion() {
        if (!BizCheckMobileDevice.isApp()) return "1.0.0"; // if web return 1.0.0
        const deviceInfo = BizCheckMobileDevice.getInfo();
        BizCheckMobileLogger.info("Device Info", deviceInfo);
        return `${deviceInfo.app_major_version}.${deviceInfo.app_minor_version}.${deviceInfo.app_build_version}`;
    }
}

interface TermConditionRequestMessage {
    header: TermConditionRequestHeader,
    body: TermConditionRequestBody
}

enum DEVICE_OS_TYPE {
    NA = "0",
    WINDOW_MOBILE = "1",
    IOS = "2",
    ANDROID = "3",
    OTHER = "4",
    BLACKBERRY = "5",
    BA_DA = "6",
    WINDOW_PHONE = "7",
}
interface TermConditionRequestHeader {
    channel_type_code: string,
    error_code: string,
    error_text: string,
    id_token: string,
    info_text: string,
    login_session_id: string,
    message_version: string,
    result: boolean,
    screen_id: string,
    language_code: string,
    timestamps: string,
    trcode: string,
    uuid: string
}

interface TermConditionRequestBody {
    refScreenID: string
}

const BizCheckMobileApp = App.getInstance();

export default BizCheckMobileApp;
