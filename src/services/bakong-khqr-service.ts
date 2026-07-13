/* eslint-disable no-unused-vars */
import DialogUtil from "@/utilities/dialog-util";
import { BizCheckMobileDateTime } from "@/shared/bizcheckmobile";
import { BakongKHQR, IndividualInfo, MerchantInfo } from "bakong-khqr";
export default class BakongKHQRService {
    private static instance: BakongKHQRService;

    private constructor() { }

    static getInstance(): BakongKHQRService {
        if (!this.instance) {
            this.instance = new BakongKHQRService();
        }
        return this.instance;
    }

    /**
     * @method generateIndividual
     * @author Rethysen
     * @param {KHQRIndividualInfo} individualInfo it's individual info to generate
     * @param {KHQROptional} option it's Optional info
     * @returns {string} Return with QR string for Individual
     * @example
     * const bakongService: BakongService = BakongService.getInstance();
     * const individualInfo: KHQRIndividualInfo = {
     *  merchantName: "John Smit",
     *  merchantCity: "PHNOM PENH",
     *  currency: "USD",
     *  amount: 10,
     *  accountInformation: "0123456789"
     * };
     *
     * const result = bakongService.generateMerchant(merchantInfo);
     *
     * // Result
     * "00020101021229320014khqr_test@ppcb011001234567895204599953038405402105802KH5909John Smit6010PHNOM PENH9917001317338885377656304F4AA"
     */
    generateIndividual(infoParam: KHQRIndividualInfo, optionParam: Partial<KHQROptional> = {}): string {
        let individualInfo: IndividualInfo;

        if (infoParam.amount > 0) {
            optionParam.expirationTimestamp = BizCheckMobileDateTime.getDate(BizCheckMobileDateTime.addDay(BizCheckMobileDateTime.getCurrentDate(), 90)).getTime();
        }

        const optional = Object.assign({}, infoParam, optionParam, {
            bakongAccountID: import.meta.env.VITE_BAKONG_ACCOUNT_ID,
            acquiringBank: import.meta.env.VITE_BAKONG_ACQUIRING_BANK
        });

        if (infoParam.currency === "USD") {
            optional.currency = KHQR_CURRENCY_CODE.USD;
        }

        if (infoParam.currency === "KHR") {
            optional.currency = KHQR_CURRENCY_CODE.KHR;
        }

        individualInfo = new IndividualInfo(
            import.meta.env.VITE_BAKONG_ACCOUNT_ID,
            this.limitString(infoParam.merchantName), // merchant name limit to 25 chars
            infoParam.merchantCity,
            optional
        );

        const bakongKHQR = new BakongKHQR();
        const response = bakongKHQR.generateIndividual(individualInfo);

        if (response.status.code === 0 && BakongKHQR.verify(response.data.qr).isValid) {
            return response.data.qr;
        } else {
            DialogUtil.showToast({
                message: response.status.message,
                duration: 1500
            });
        }
        return "";
    }

    /**
     * @namespace generateMerchant
     * @author Rethysen
     * @param {KHQRMerchantInfo} merchantInfo
     * @param {KHQROptional} optionalInfo
     * @returns - Return with QR string for Merchant
     * @example
     * const bakongService: BakongService = BakongService.getInstance();
     * const merchantInfo: KHQRMerchantInfo = {
     *  merchantID: "123456",
     *  merchantName: "Jonh Smith", // it's Customer Name or Account Name
     *  merchantCity: "PHNOM PENH"
     * };
     * const optionalInfo: KHQROptional = {
     * // add more with your option
     * };
     * bakongService.generateMerchant(merchantInfo, optionalInfo);
     */
    generateMerchant(infoParam: KHQRMerchantInfo, optionParam: Partial<KHQROptional> = {}): string {
        let merchantInfo: MerchantInfo;

        if (infoParam.amount > 0) {
            optionParam.expirationTimestamp = BizCheckMobileDateTime.getDate(BizCheckMobileDateTime.addDay(BizCheckMobileDateTime.getCurrentDate(), 90)).getTime();
        }

        const optional = Object.assign(infoParam, optionParam);

        if (infoParam.currency === "USD") {
            optional.currency = KHQR_CURRENCY_CODE.USD;
        }

        if (infoParam.currency === "KHR") {
            optional.currency = KHQR_CURRENCY_CODE.KHR;
        }

        merchantInfo = new MerchantInfo(
            infoParam.bakongAccountID,
            this.limitString(infoParam.merchantName), // merchant name limit to 25 chars
            infoParam.merchantCity,
            infoParam.merchantID,
            infoParam.acquiringBank,
            optional
        );

        const khqr = new BakongKHQR();
        const response = khqr.generateMerchant(merchantInfo);
        if (response.status.code === 0 && BakongKHQR.verify(response.data.qr).isValid) {
            return (response.data as any).qr;
        } else {
            DialogUtil.showToast({
                message: response.status.message,
                duration: 1500
            });
        }
        return "";
    }

    /**
     * @namespace decodeQRString
     * @author Rethysen
     * @param qrString
     * @returns {DecodeResponseData}
     */
    decodeQRString(qrString: string): DecodeResponseData {
        let deCodeData: DecodeResponseData = {} as DecodeResponseData;
        try {
            deCodeData = BakongKHQR.decode(qrString)?.data as DecodeResponseData;
        } catch {
            // If the QR code is not valid or cannot be decoded, it will return an empty object
        }
        return deCodeData;
    }

    verifyQR(qrString: string): boolean {
        return BakongKHQR.verify(qrString).isValid;
    }

    /**
     * @author Chansopheaktra
     * @param str
     * @returns string
     * @description
     *
     * limit string to 25 chars. Replace the last 3 chars to ...
     */
    private limitString(str: string): string {
        return str.replace(/(.{22})...+/, "$1...");
    }
}

export interface KHQRIndividualInfo {
    merchantName: string;
    merchantCity: string;
    currency: string;
    amount: number;
    accountInformation: string;
}

export interface KHQROptional {
    billNumber?: string;
    purposeOfTransaction?: string;
    languagePreference?: string;
    merchantNameAlternateLanguage?: string;
    merchantCityAlternateLanguage?: string;
    upiMerchantAccount?: string;
    expirationTimestamp?: number
}

export interface KHQRMerchantInfo extends KHQRIndividualInfo {
    merchantID: string;
    merchantName: string;
    merchantCity: string;
    currency: string;
    amount: number;
    storeLabel: string;
    terminalLabel: string;
    mobileNumber: string;
    bakongAccountID: string;
    acquiringBank: string;
}

export interface DecodeResponseData {
    accountInformation: string;
    acquiringBank: string;
    bakongAccountID: string;
    billNumber: string;
    countryCode: string;
    crc: string;
    languagePreference: string;
    merchantCategoryCode: string;
    merchantCity: string;
    merchantCityAlternateLanguage: string;
    merchantID: string;
    merchantName: string;
    merchantNameAlternateLanguage: string;
    merchantType: string;
    mobileNumber: string;
    payloadFormatIndicator: string;
    pointofInitiationMethod: string;
    purposeOfTransaction: string;
    storeLabel: string;
    terminalLabel: string;
    timestamp: string;
    transactionAmount: number;
    transactionCurrency: string;
    unionPayMerchant: string;
}

export enum KHQR_CURRENCY_CODE {
    USD = "840", // USD - 840
    KHR = "116" // Khmer Riel - 116
}

export enum KHQR_MERCHANT_TYPE {
    INDIVIDUAL = "29",
    MERCHANT = "30"
}