/* eslint-disable no-unused-vars */
import { BizCheckMobileApp, BizCheckMobileLogger, BizCheckMobileProperties } from "@/shared/bizcheckmobile";
import DialogUtil from "./dialog-util";
import CheckErpHeader from "@/services/checkerp-header";
import { getTokenSync } from "@/services/token-store";

export default class OCRDocument {
    private checkErpHeader: CheckErpHeader;

    constructor() {
        this.checkErpHeader = new CheckErpHeader();
    }

    openCamera(option: { callback: (response: any) => void }) {
        BizCheckMobileApp.callPlugin({
            pluginKey: "CAMERA_ID_CARD_PLUGIN",
            params: {
                header: {
                    result: true,
                    error_code: "",
                    erro_message: ""
                },
                body: {}
            },
            callback: (response: any) => {
                BizCheckMobileLogger.info("", response);
                if (response.header.result) option.callback(response.body);
            }
        });
    }

    extract(filePath: string, option: Partial<{ timeout: number, callback: (response: any) => void }> = {}) {
        const token = getTokenSync();
        DialogUtil.showLoading();
        BizCheckMobileApp.callPlugin({
            pluginKey: "EXTRACT_ID_CARD_PLUGIN",
            params: {
                header: {
                    result: true,
                    error_code: "",
                    erro_message: ""
                },
                body: {
                    url: `${import.meta.env.VITE_SERVER_PROTOCOL}://${BizCheckMobileProperties.get("app_subdomain") ? BizCheckMobileProperties.get("app_subdomain") + "." : ""}${import.meta.env.VITE_SERVER_DOMAIN}/${import.meta.env.VITE_SERVER_CONTENT}/CKY01001I01`,
                    access_token: token?.accessToken ?? "",
                    file_path: filePath,
                    timeout: 120,
                    payload: {
                        header: this.checkErpHeader.getHeader("CKY01001I01"),
                        payload: {
                            sourceSystemCode: "LOS",
                            businessCategoryLevel1: "CUS",
                            businessCategoryLevel2: "CKY",
                            expireDateTime: "",
                            remark: "Using Upload Adapter"
                        }
                    }
                }
            },
            callback: (response: any) => {
                DialogUtil.closeLoading();
                if (response.header.messageInfo.result) {
                    BizCheckMobileLogger.info("extract => ", response);
                    if (option.callback) option.callback(response.payload);
                } else {
                    DialogUtil.showAlert({ message: `${response.header.messageInfo.message} (${response.header.messageInfo.code})` });
                }
            }
        });
    }
}