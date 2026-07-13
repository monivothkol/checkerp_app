/* eslint-disable no-unused-vars */
const bizCheckMobile = window.bizCheckMobile;

class Locale {
    
    private static instance: Locale;

    private constructor() {}

    static getInstance(): Locale {
        if ( !this.instance ) {
            this.instance = new Locale();
        }
        return this.instance;
    }

    getLocale() {

        const getLocale = (): Promise<any> => {
            return new Promise((resolve) => {
                bizCheckMobile.gateway("Localization", "getLocale", { _fCallback: (response: any) => { resolve(response); } });
            });

        };

        const getValue = async () => {
            return await getLocale();
        };

        const response = getValue();

        return response;

    }

    setLocale(code: string) {
      bizCheckMobile.gateway("Localization", "setLocale", {_sLocaleCd: code});
    }
}

const BizCheckMobileLocale = Locale.getInstance();

export default BizCheckMobileLocale;
