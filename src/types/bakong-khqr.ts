/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-unused-vars */
declare module "bakong-khqr" {
    export interface khqrData {
        currency: {
            usd: 840;
            khr: 116;
        };
        merchantType: {
            merchant: "merchant";
            individual: "individual";
        };
    }
    export class SourceInfo {
        constructor(appIconUrl: string, appName: string, appDeepLinkCallback: string);
    }

    interface KHQROptional {
        accountInformation: string;
        acquiringBank: string;
        currency: string;
        amount: number;
        billNumber: string;
        storeLabel: string;
        terminalLabel: string;
        mobileNumber: string;
        purposeOfTransaction: string;
        languagePreference: string;
        merchantNameAlternateLanguage: string;
        merchantCityAlternateLanguage: string;
        upiMerchantAccount: string;
        expirationTimestamp: number
    }

    export class IndividualInfo {
        constructor(bakongAccountID: string, merchantName: string, merchantCity: string, optional: Partial<KHQROptional>);
    }
    export class MerchantInfo extends IndividualInfo {
        constructor(bakongAccountID: string, merchantName: string, merchantCity: string, merchantID: string, acquiringBank: string, optional: Partial<KHQROptional>);
    }
    interface KHQRResponse {
        status: {
            code: number;
            errorCode: number;
            message: string;
        };
        data: {
            qr: string;
            md5: string;
        };
    }
    export class BakongKHQR {
        generateIndividual(info: IndividualInfo): KHQRResponse;
        generateMerchant(info: any): KHQRResponse;
        static decode(qrString: string): any;
        static decodeNonKhqr(qrString: string): any;
        static verify(qrString: string): { isValid: boolean };
        generateDeepLink(url: string, qr: string, sourceInfo: SourceInfo): KHQRResponse;
        checkBakongAccount(url: string, bakongID: string): Promise<{ bakongAccountExisted: boolean }>;
    }
}
