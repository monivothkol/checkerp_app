/* eslint-disable no-unused-vars */
// import { encode } from "url-safe-base64";
import { PROPERTIES_KEY } from "../enum/properties";
import LocaleService from "../service/locale-service";
import Modal from "../util/modal";
import BizCheckMobileDevice from "./bizcheckmobile-device";
import BizCheckMobileLogger from "./bizcheckmobile-logger";
import BizCheckMobileNetwork from "./bizcheckmobile-network";
import BizCheckMobileProperties from "./bizcheckmobile-properties";

const bizCheckMobile = window.bizCheckMobile;

class Authenticate {

    private static instance: Authenticate;
    private static publicKey: string;

    static getInstance(): Authenticate {

        if (!this.instance) {
            this.instance = new Authenticate();
        }

        return this.instance;
    }

    generatePublicKey(option: { callback: (publicKey: string) => void }) {
        bizCheckMobile.gateway("Token", "getPublicKey", {
            _fCallback: (response: any) => {
                if (response.header.result) {
                    Authenticate.publicKey = response.body.publicKey; // encode(result.publicKey);
                    option.callback(response.body.publicKey);
                } else {
                    BizCheckMobileLogger.error("Error generate public key");
                }
            }
        });
    }

    issueToken(option: Partial<{ callback?: () => void, onFailed?: () => void }> = {}) {
        if (BizCheckMobileProperties.isUserLogin()) {
            const token: Token = BizCheckMobileProperties.getToken();
            BizCheckMobileNetwork.setAccessToken(token.accessToken);
            if (option.callback) option.callback();
            return;
        }

        const makeIssueToken = (publicKey: string) => {
            bizCheckMobile.gateway("Token", "issueToken", {
                _sDeviceID: BizCheckMobileDevice.getMacAddress(),
                _sPublicKey: publicKey,
                _nReadTimeout: import.meta.env.VITE_APP_NETWORK_TIMEOUT,
                _fCallback: (resData: any) => {
                    BizCheckMobileLogger.info("issueToken response: ", resData);
                    if (resData.header.result) {
                        BizCheckMobileNetwork.setAccessToken(resData.body.accessToken);
                        BizCheckMobileProperties.setToken(resData.body);
                        if (option.callback) option.callback();
                    } else {
                        BizCheckMobileLogger.error("cannot issueToken: ", resData);
                        if (option.onFailed) option.onFailed();
                        if (Modal.isLoadingPresent) Modal.getInstance().dismissLoading();
                        if (resData.header.error_code === "ERR_NETWORK") {
                            Modal.getInstance().alert(`${LocaleService.getInstance().translate("ERROR.APP_SHIELD.WERE_HAVING_TROUBLE_CONNECTING_TO_THE_SE")}<br>(${resData.header.error_code})`, { title: LocaleService.getInstance().translate("ERROR.APP_SHIELD.CONNECTION_ISSUE") });
                        }
                        else {
                            Modal.getInstance().alert(`${LocaleService.getInstance().translate("ERROR.APP_SHIELD.WERE_HAVING_TROUBLE_CONNECTING_TO_THE_SE")}<br>(500)`, { title: LocaleService.getInstance().translate("ERROR.APP_SHIELD.CONNECTION_ISSUE") });
                        }
                    }
                }
            });
        };

        this.generatePublicKey({
            callback: (publicKey: string) => {
                makeIssueToken(publicKey);
            }
        });
    }

    refreshToken(option: { _sDeviceID: string, _sRefreshToken: string, _sUserID: string, callback: () => void, failed: (error: any) => void }) {

        const makeRefreshToken = (publicKey: string) => {
            const token: Token = BizCheckMobileProperties.getToken();
            bizCheckMobile.gateway("Token", "refreshToken",
                {
                    _sDeviceID: option._sDeviceID,
                    _sPublicKey: publicKey,
                    _sUserID: option._sUserID,
                    _sRefreshToken: option._sRefreshToken,
                    _sAccessToken: token.accessToken,
                    _nReadTimeout: import.meta.env.VITE_APP_NETWORK_TIMEOUT,
                    _fCallback: (resData: any) => {
                        if (resData.header.result) {
                            BizCheckMobileNetwork.setAccessToken(resData.body.accessToken);
                            BizCheckMobileProperties.setToken(resData.body);
                            option.callback();
                        } else {
                            if (Modal.isLoadingPresent) Modal.getInstance().dismissLoading();
                            option.failed(resData.header);
                        }
                    }
                }
            );
        };

        this.generatePublicKey({
            callback: (publicKey) => {
                makeRefreshToken(publicKey);
            },
        });
    }

    isExpToken(): boolean {
        let expiredToken = false;
        const lastTimeToken = Number(BizCheckMobileProperties.get(PROPERTIES_KEY.TOKEN_EXP_TIME));
        const currentTime = Math.floor(Date.now() / 1000);
        if ((currentTime - lastTimeToken) > import.meta.env.VITE_APP_TIME_EXP_TOKEN) expiredToken = true;
        return expiredToken;
    }
}

export interface Token {
    accessToken: string,
    refreshToken: string,
    expiredIn: number,
    grantType: string,
    encryptCryptoAesKey: string
}

const BizCheckMobileAuth = Authenticate.getInstance();

export default BizCheckMobileAuth;