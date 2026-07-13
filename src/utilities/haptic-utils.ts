import { BizCheckMobileApp, BizCheckMobileLogger } from "@/shared/bizcheckmobile";

export function onHaptic(option: { sound: boolean, vibration: boolean, positive: boolean }) {
    BizCheckMobileLogger.log("onHyptic");
    BizCheckMobileApp.callPlugin({
        pluginKey: "HAPTIC_PLUGIN",
        params: {
            header: {
                result: false,
                // eslint-disable-next-line camelcase
                error_code: "",
                // eslint-disable-next-line camelcase
                error_message: "",
            },
            body: {
                sound: option.sound,
                vibration: option.vibration,
                positive: option.positive
            }
        },
        callback: (response) => {
            BizCheckMobileLogger.info("Haptic Response: ", response);
        }
    });
};