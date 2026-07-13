/* eslint-disable no-unused-vars */
import LocaleService from "../service/locale-service";
import BizCheckMobileApp from "./bizcheckmobile-app";
import BizCheckMobileDevice from "./bizcheckmobile-device";
import BizCheckMobileLogger from "./bizcheckmobile-logger";

class BioAuthenticate {
    private static instance: BioAuthenticate;
    private localService = LocaleService.getInstance();

    private static _isShowingBio = false;

    static getInstance(): BioAuthenticate {
        if (!this.instance) {
            this.instance = new BioAuthenticate();
        }
        return this.instance;
    }

    set isShowingBio(value: boolean) {
        BioAuthenticate._isShowingBio = value;
    }

    get isShowingBio() {
        return BioAuthenticate._isShowingBio;
    }

    /**
     * @author Rethysen
     * @namespace getBioType
     * @param {EventListener} listener
     * @param {Function} listener.onSuccess - It's callback with success case
     * @param {Function} listener.onFail    - It's callback with fail case
     * 
     * @example
     * BioAuthService.getInstance.getBioType({
     *  onSuccess(...) {...},
     *  onFail(...) {...}
     * });
     */
    getBioType(listener: EventListener) {
        BizCheckMobileApp.callPlugIn("BIOMETRIC_PLUGIN", {
            param: {
                type: "type"
            },
            callback: (response: any) => {
                BizCheckMobileLogger.info("BIOMETRIC_PLUGIN ", response);
                if (response.result) listener.onSuccess(response.type);
                else if (listener.onFail) listener.onFail(response.errorMessage);
            }
        });
    }

    /**
     * @author Rethysen
     * @namespace isAvailable
     * @param {EventListener} listener
     * @param {Function} listener.onSuccess - It's callback with success case
     * @param {Function} listener.onFail    - It's callback with fail case
     * 
     * @example
     * BioAuthService.getInstance.isAvailable({
     *  onSuccess(...) {...},
     *  onFail(...) {...}
     * });
     */
    isAvailable(listener: EventListener) {
        if (BizCheckMobileDevice.isApp()) {
            BizCheckMobileApp.callPlugIn("BIOMETRIC_PLUGIN", {
                param: {
                    type: "available"
                },
                callback: (response: any) => {
                    BizCheckMobileLogger.info("available ", response);
                    listener.onSuccess(response);
                }
            });
        } else {
            listener.onSuccess(false);
        }
    }

    /**
     * @author Rethysen
     * @namespace isAvailable
     * @param {EventListener} listener
     * @param {Function} listener.onSuccess - It's callback with success case
     * @param {Function} listener.onFail    - It's callback with fail case
     * 
     * @example
     * BioAuthService.getInstance.isAvailable({
     *  onSuccess(...) {...},
     *  onFail(...) {...}
     * });
     */
    authenticate(listener: EventListener) {
        BizCheckMobileApp.callPlugIn("BIOMETRIC_PLUGIN", {
            param: {
                type: "auth",
                title: this.localService.translate("COMMON.LABEL.PLEASE_POSITION_YOUR_BIOMETRIC")
            },
            callback: (response: any) => {
                BizCheckMobileLogger.info("Authenticate: ", response);
                if (response.result) listener.onSuccess(response.type);
                else if (listener.onFail) listener.onFail(response);
            }
        });
    }

    /**
     * @author Rethysen
     * @namespace isAvailable
     * @param {EventListener} listener
     * @param {Function} listener.onSuccess - It's callback with success case
     * @param {Function} listener.onFail    - It's callback with fail case
     * 
     * @example
     * BioAuthService.getInstance.isAvailable({
     *  onSuccess(...) {...},
     *  onFail(...) {...}
     * });
     */
    cancelAuthenticate() {
        BizCheckMobileApp.callPlugIn("BIOMETRIC_PLUGIN", {
            param: {
                type: "cancel"
            },
            callback: (response: any) => {
                // alert("BIOMETRIC_PLUGIN Call: " + JSON.stringify(response));
            }
        });
    }

    /**
     * @namespace createRSAKeyPair
     * @param option
     * @param {RSAKeyPairParam} option.param
     * @param {Callback(RSAKeyPairResponse)} option.callback
     */
    createRSAKeyPair(option: { param: RSAKeyPairParam, callback: (response: RSAKeyPairResponse) => void }) {
        BizCheckMobileApp.callPlugIn("AUTH_SECURITY_PLUGIN", {
            param: { ...option.param, action: "createRSAKeyPair" },
            callback: (res) => {
                BizCheckMobileLogger.info("createRSAKeyPair: ", res);
                option.callback(res);
            },
        });
    }

    /**
     * @namespace decryptRSA
     * @param option
     * @param {DecryptRSAParam} option.param
     * @param {Callback(DecryptRSAResponse)} option.callback
     */
    decryptRSA(option: { param: DecryptRSAParam, callback: (response: DecryptRSAResponse) => void }) {
        BizCheckMobileApp.callPlugIn("AUTH_SECURITY_PLUGIN", {
            param: {
                action: "decryptRSA",
                ...option.param
            },
            callback: (res) => {
                BizCheckMobileLogger.info("decryptRSA: ", res);
                option.callback(res);
            }
        });
    }

    /**
     * @namespace decryptAES
     * @param option
     * @param {DecryptAESParam} option.param
     * @param {Callback(DecryptAESResponse)} option.callback
     */
    decryptAES(option: { param: DecryptAESParam, callback: (response: DecryptAESResponse) => void }) {
        BizCheckMobileApp.callPlugIn("AUTH_SECURITY_PLUGIN", {
            param: {
                action: "decryptAES",
                ...option.param
            },
            callback: (res) => {
                BizCheckMobileLogger.info("decryptAES: ", res);
                option.callback(res);
            }
        });
    }

    /**
     * @namespace encryptRSA
     * @param option
     * @param {*} option.param
     * @param {Callback} option.callback
     */
    public encryptRSA(option: { param: Record<string, any>, callback: (response: any) => void }) {
        BizCheckMobileApp.callPlugIn("AUTH_SECURITY_PLUGIN", {
            param: {
                action: "encryptRSA",
                ...option.param
            },
            callback: (res) => {
                BizCheckMobileLogger.info("encryptRSA: ", res);
                option.callback(res);
            }
        });
    }

    /**
     * @namespace checkAESKey
     * @param option
     * @param {*} option.param
     * @param {Callback} option.callback
     */
    public checkAESKey(option: { param: Record<string, any>, callback: (response: any) => void }) {
        BizCheckMobileApp.callPlugIn("AUTH_SECURITY_PLUGIN", {
            param: {
                action: "checkAESKey",
                ...option.param
            },
            callback: (res) => {
                BizCheckMobileLogger.info("checkAESKey: ", res);
                option.callback(res);
            }
        });
    }
}

interface EventListener {
    onSuccess(response: any): void;
    onFail?(error: any): void;
}

interface RSAKeyPairParam {
    body: object,
    header: RSAKeyPairParamHeader
}

interface RSAKeyPairParamHeader {
    result: boolean,
    apiName: "createRSAKeyPair",
    language: string,
    osType: string,
    displayType: string,
    errorCode: string,
    errorText: string
}
interface RSAKeyPairResponse {
    header: {
        result: boolean;
        errorCode: string;
    };
    body: {
        publicKey: string;
    };
}
interface DecryptRSAParam {
    body: DecryptRSAParamBody,
    header: DecryptRSAParamHeader
}
interface DecryptRSAParamHeader {
    result: boolean,
    apiName: "decryptRSA",
    language: string,
    osType: string,
    displayType: string,
    errorCode: string,
    errorText: string
}
interface DecryptRSAParamBody {
    encryptAESKey: string,
    encryptAESIVKey: string
}

interface DecryptRSAResponse {
    header: {
        result: boolean;
        errorCode: string;
        errorText: string;
    };
    body: object;
}

interface DecryptAESParam {
    body: DecryptAESParamBody,
    header: DecryptAESParamHeader
}

interface DecryptAESParamBody {
    authCode: string
}

interface DecryptAESParamHeader {
    result: boolean,
    apiName: "decryptAES",
    language: string,
    osType: string,
    displayType: string,
    errorCode: string,
    errorText: string
}

interface DecryptAESResponse {
    header: {
        result: boolean;
        errorCode: string;
        errorText: string;
    };
    body: {
        authCode: string;
    };
}
const BizCheckMobileAuthBio = BioAuthenticate.getInstance();
export default BizCheckMobileAuthBio;