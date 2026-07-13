import BizCheckMobileDevice from "./bizcheckmobile-device";

/* eslint-disable no-unused-vars */
const bizCheckMobile = window.bizCheckMobile;
class System {
    private static instance: System | null = null;

    // Private constructor to prevent direct instantiation
    private constructor() { }

    // Get the singleton instance
    static getInstance(): System {

        if (!this.instance) {
            this.instance = new System();
        }
        return this.instance;
        
    }

    callTEL(phoneNumber: string, callback?: (response: any) => void): void {
        bizCheckMobile.gateway("System", "callTEL", { _sNumber: phoneNumber, _fCallback: callback }, ["_sNumber"]);
    }

    callSMS(arg: { phoneNumbers: string[], message?: string, callback?: (response: any) => void }){
        bizCheckMobile.gateway("System", "callSMS", { _aNumber: arg.phoneNumbers, _sMessage:arg.message,  _fCallback: arg.callback }, ["_aNumber"]);
    }

    callBrowser(url: string, callback?: (response: any) => void): void {
        
        if (!BizCheckMobileDevice.isApp()) {
            
            // eslint-disable-next-line no-restricted-globals
            (window as any).open(url);
            return;
        }

        bizCheckMobile.gateway("System", "callBrowser", { _sURL: url, _fCallback: callback }, ["_sURL"]);
    }

    callCamera(callback: (response: any) => void) {
        bizCheckMobile.gateway("System", "callCamera", {_sDirectory: "", _sFileName: "", _bAutoVerticalHorizontal: false, _fCallback: callback});
    }

    callGallery(option: { maxSelect?: number, callback: (response: any) => void }) {
        bizCheckMobile.gateway("System", "callGallery", {_sType: "image", _nMaxCount: option.maxSelect === 0 ? 1 : option.maxSelect, _fCallback: option.callback });
    }

    callMap(lat: string, long: string) {
        const location = lat + ", " + long;
        bizCheckMobile.gateway("System", "callMap", {_sLocation: location});
    }

    getGPS(option?: { callback?: (response: any) => void }): void {
        bizCheckMobile.gateway("System", "getGPS", {_fCallback: option?.callback});
    }
}

const BizCheckMobileSystem = System.getInstance();

export default BizCheckMobileSystem;