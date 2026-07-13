/* eslint-disable no-unused-vars */
import { BizCheckMobileApp, BizCheckMobileDevice, BizCheckMobileEvents, BizCheckMobileLogger } from "@/shared/bizcheckmobile";

export default class NetworkStrength {
    private static NONE_STATUS_COUNT: number = 0;
    public register() {
        BizCheckMobileApp.callPlugin({
            pluginKey: "NETWORK_STRENGTH_PLUGIN",
            params: {
                header: {},
                body: {
                    type: "register"
                }
            },
            callback: (response) => {
                BizCheckMobileLogger.info("NETWORK_STRENGTH_PLUGIN", response);
            }
        });
    }

    public listener(options: { onUpdate: (response: any) => void }) {
        BizCheckMobileEvents.register({
            eventName: "onNetworkStrength",
            callback: (data: any) => {

                BizCheckMobileLogger.log("onNetworkStrength ======>  ", data);

                if (data.message && data.message.status && ["none", "unknown"].includes(data.message.signal_strength)) {
                    NetworkStrength.NONE_STATUS_COUNT++;
                    if (NetworkStrength.NONE_STATUS_COUNT >= 3) {
                        options.onUpdate({ message: { result: true, signal_strength: "low", status: true, type: data.message.type } });
                        this.register();
                    } else {
                        options.onUpdate({ message: { result: false, signal_strength: "none", status: false, type: data.message.type } });
                    }
                    return;
                }

                options.onUpdate(BizCheckMobileDevice.isApp() ? data : { message: { result: true, signal_strength: "high", status: true, type: "wifi" } });
            }
        });
    }

    public unListener() {
        BizCheckMobileEvents.remove({ eventName: "onNetworkStrength" });
    }
}