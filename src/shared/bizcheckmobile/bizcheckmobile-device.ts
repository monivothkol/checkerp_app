import dayjs from "dayjs";
import { PROPERTIES_KEY } from "../enum/properties";
import BizCheckMobileProperties from "./bizcheckmobile-properties";

const bizCheckMobile = window.bizCheckMobile;
class Device {
    private static instance: Device;

    // Private constructor to prevent direct instantiation
    private constructor() { }

    // Get the singleton instance
    static getInstance(): Device {

        if (!this.instance) {
            this.instance = new Device();
        }
        return this.instance;

    }

    getInfo(arg: Partial<{ key: string }> = {}): any {
        if (!this.isApp() || !bizCheckMobile?.Device) {
            return {
                device_id: this.getUUID(),
                device_os_type: "WEB",
                device_os_version: navigator.userAgent,
                device_model: navigator.platform,
                app_version: "WEB",
                app_build_number: "WEB",
            };
        } else {
            return bizCheckMobile.Device.getInfo({ _sKey: arg.key });
        }
    }

    isApp(): boolean {
        if (!bizCheckMobile?.gateway) {
            return false; // Web environment
        }
        return bizCheckMobile.gateway("DeviceManager", "isApp");
    }

    isAndroid() {
        if (!bizCheckMobile?.gateway) {
            return false; // Web environment
        }
        return bizCheckMobile.gateway("DeviceManager", "isAndroid");
    }

    isIOS() {
        if (!bizCheckMobile?.gateway) {
            return false; // Web environment
        }
        return bizCheckMobile.gateway("DeviceManager", "isIOS");
    }

    getMacAddress(): string {

        if (BizCheckMobileDevice.isApp()) {
            return BizCheckMobileDevice.getInfo()["device_id"];
        } else {
            if (BizCheckMobileProperties.get(PROPERTIES_KEY.MAC_ADDRESS)) {
                return BizCheckMobileProperties.get(PROPERTIES_KEY.MAC_ADDRESS);
            } else {
                const macAddress = `emulator-${this.getUUID().substring(0, 8)}`;
                BizCheckMobileProperties.set(PROPERTIES_KEY.MAC_ADDRESS, macAddress);
                return macAddress;
            }
        }

    }

    getUUID(): string {
        let d = new Date().getTime();
        if (typeof performance !== "undefined" && typeof performance.now === "function") {
            d += performance.now(); //use high-precision timer if available
        }
        const newGuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            const r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
        });
        //modified uuid to append YYYYMMDD
        return `${newGuid}-${dayjs().format("YYYYMMDDhhmm")}`;
    }
}

const BizCheckMobileDevice: Device = Device.getInstance();

export default BizCheckMobileDevice;
