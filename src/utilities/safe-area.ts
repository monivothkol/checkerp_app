import { BizCheckMobileDevice, BizCheckMobileProperties } from "@/shared/bizcheckmobile";

export default class SafeArea {
    static setHeigh(option: { height: number }) {

        if (!BizCheckMobileDevice.isApp()) {
            document.documentElement.style.setProperty("--safeArea", "20px");
            document.documentElement.style.setProperty("--minHeight", "60px");
            return;
        }

        if (Number(BizCheckMobileProperties.get("statusBarHeight") || "0") > 0) {
            const height = BizCheckMobileProperties.get("statusBarHeight");
            this.setProperties({ height: height });
            return;
        }

        BizCheckMobileProperties.set("statusBarHeight", option.height);
        this.setProperties(option);
    }

    private static setProperties(option: { height: number }) {
        const height = BizCheckMobileDevice.isIOS() ? option.height + 60 : option.height;
        document.documentElement.style.setProperty("--safeArea", `${height}px`);
        document.documentElement.style.setProperty("--minHeight", `${option.height}px`);
    }
}