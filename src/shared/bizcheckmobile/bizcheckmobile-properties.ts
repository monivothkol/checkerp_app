import type { UserInformation } from "../adapter/login/security";
import { PROPERTIES_KEY } from "../enum/properties";
// import LocaleService from "../service/locale-service";
import BizCheckMobileApp from "./bizcheckmobile-app";
import type { Token } from "./bizcheckmobile-auth";
import BizCheckMobileDevice from "./bizcheckmobile-device";

const bizCheckMobile = window.bizCheckMobile;

class Properties {

    private static instance: Properties;
    // private localeService = LocaleService.getInstance();

    // Private constructor to prevent direct instantiation
    private constructor() { }

    // Get the singleton instance
    static getInstance(): Properties {

        if (!this.instance) {
            this.instance = new Properties();
        }
        return this.instance;
    }

    set(key: string, value: any) {
        if (typeof value == "object") {
            value = JSON.stringify(value);
        }

        bizCheckMobile.gateway("Properties", "set", { _sKey: key, _vValue: value }, ["_sKey", "_vValue"]);
    }

    get(key: string) {
        return bizCheckMobile.gateway("Properties", "get", { _sKey: key }, ["_sKey"]);
    }


    remove(key: string) {
        bizCheckMobile.gateway("Properties", "remove", { _sKey: key }, ["_sKey"]);
    }

    clear(option: Partial<{ callback?: () => void }> = {}) {
        bizCheckMobile.gateway("Properties", "clear", { _sKey: "", _fCallback: option.callback }, ["_sKey"]);
    }

    initFStorage(param: Partial<{ callback: () => void }> = {}) {
        if (BizCheckMobileDevice.isApp()) {
            BizCheckMobileApp.fStorage(param);
        } else {
            param.callback?.();
        }
    }

    setUserInfo(userInfo: UserInformation) {
        this.set(PROPERTIES_KEY.USER_INFO, userInfo);
    }

    getUserInfo() {
        let userInfo: UserInformation = {} as UserInformation;
        if (this.get(PROPERTIES_KEY.USER_INFO) !== undefined && this.get(PROPERTIES_KEY.USER_INFO) !== null && this.get(PROPERTIES_KEY.USER_INFO) !== "") {
            userInfo = JSON.parse(this.get(PROPERTIES_KEY.USER_INFO) || {});
        }
        return userInfo;
    }

    isUserLogin() {
        return Object.keys(this.getUserInfo() || {}).length > 0;
    }

    setToken(token: Token) {
        this.set(PROPERTIES_KEY.TOKEN, token);
    }

    getToken() {

        let token: Token = {} as Token;

        if (this.get(PROPERTIES_KEY.TOKEN) && this.get(PROPERTIES_KEY.TOKEN) !== null && this.get(PROPERTIES_KEY.TOKEN) !== "") {
            token = JSON.parse(this.get(PROPERTIES_KEY.TOKEN) || {}) as Token;
        }

        return token;
    }

    setPushSetting(setting: PushSetting) {
        this.set(PROPERTIES_KEY.PUSH_SETTING, setting);
    }

    getPushSetting() {
        let pushSetting: PushSetting = {} as PushSetting;

        if (this.get(PROPERTIES_KEY.PUSH_SETTING) && this.get(PROPERTIES_KEY.PUSH_SETTING) !== null && this.get(PROPERTIES_KEY.PUSH_SETTING) !== "") {
            pushSetting = JSON.parse(this.get(PROPERTIES_KEY.PUSH_SETTING) || {}) as PushSetting;
        }

        return pushSetting;
    }

    getSystemLanguage() {
        if (!BizCheckMobileDevice.isApp()) return "en-US";
        return this.get("system_language");
    }
}

export interface PushSetting {
    setting: boolean,
    transaction: boolean,
    notDisturb: boolean,
    promotion: boolean,
    newsAndEvent: boolean
}

const BizCheckMobileProperties = Properties.getInstance();

export default BizCheckMobileProperties;
