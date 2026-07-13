/* eslint-disable no-unused-vars */
const bizCheckMobile = window.bizCheckMobile;
class Network {
    private static instance: Network;

    // Private constructor to prevent direct instantiation
    private constructor() { }

    // Get the singleton instance
    static getInstance(): Network {

        if (!this.instance) {
            this.instance = new Network();
        }
        return this.instance;
    }

    changeLocale(localeCode: string) {
        bizCheckMobile.gateway("Network", "changeLocale", { _sLocaleCd: localeCode }, ["_sLocaleCd"]);
    }

    requestLogin(trCode: string, userId: string, password: string, option: Partial<{ header: object; body: object }> = {}, callback: (response: any) => void) {
        const param = { _sUserId: userId, _sPassword: password, _sTrcode: trCode, _oHeader: option.header, _oBody: option.body, _bProgressEnable: false, _bMock: false, _fCallback: callback };
        bizCheckMobile.gateway("Network", "requestLogin", param, ["_sUserId", "_sPassword"]);
    }

    requestTr(trCode: string, header: any, body: any, isMock: boolean, timeout: number, callback: (response: any) => void) {
        const param = { _sTrcode: trCode, _oHeader: header, _oBody: body, _bProgressEnable: false, _bMock: isMock, _nTimeout: timeout, _fCallback: callback };
        bizCheckMobile.gateway("Network", "requestTr", param, ["_sTrcode"]);
    }

    requestHttp(url: string, method: "GET" | "POST", option: Partial<{ header: any; body: any }> = {}, timeout: number, callback: (response: any) => void) {
        const param = { _sUrl: url, _sMethod: method, _oHeader: option.header, _oBody: option.body, _bProgressEnable: true, _bMock: false, _nTimeout: timeout, _fCallback: callback };
        bizCheckMobile.gateway("Network", "requestHttp", param, ["_sUrl", "_sMethod"]);
    }

    requestApi(url: string, method: "GET" | "POST", option: Partial<{ header: object; body: object }> = {}, callback: (response: any) => void) {
        const param = { _sUrl: url, _sMethod: method, _oHeader: option.header, _oBody: option.body, _bMock: false, _fCallback: callback };
        bizCheckMobile.gateway("Network", "requestApi", param, ["_sUrl", "_sMethod"]);
    }

    setAccessToken(accessToken: string) {
        bizCheckMobile.setConfig("Network", {
            _sCryAuthToken: accessToken
        });
    }

    getAuthToken() {
        return bizCheckMobile.getConfig("Network")["_sCryAuthToken"];
    }
}

const BizCheckMobileNetwork = Network.getInstance();

export default BizCheckMobileNetwork;
