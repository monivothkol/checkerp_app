import { defineStore } from "pinia";
import SubmitCheckIn from "@/services/api/ATD/submitCheckIn";

/** Result banner: `titleKey` is an i18n suffix the screen resolves via tr(). */
export interface CheckInResult {
    ok: boolean;
    titleKey: string;
    detail: string;
}

/** ATD40000 staff self check-in store: owns the punch submit + result/cooldown state. */
export const ATD40000Store = defineStore("ATD40000Store", {
    state: () => ({
        submitting: false,
        cooldownUntil: 0,
        manualToken: "",
        result: null as CheckInResult | null,
        submitApi: SubmitCheckIn.getInstance()
    }),
    actions: {
        /** Post the scanned/pasted token; fills the next punch slot and sets the result banner. */
        submit(token: string) {
            if (this.submitting || !token) return;
            this.submitting = true;
            this.submitApi.request({
                dataBody: { token },
                listener: {
                    onSuccess: (p) => {
                        this.submitting = false;
                        this.cooldownUntil = Date.now() + 4000; // ignore camera hits while banner shows
                        this.manualToken = "";
                        const action = p.action ?? "";
                        const time = String(p.time ?? "").slice(11, 16);
                        this.result = {
                            ok: action !== "ALREADY_COMPLETE",
                            titleKey: "ACT_" + (action || "ERROR"),
                            detail: `${p.staffName ?? ""} · ${time}`
                        };
                    },
                    onFail: (error: { message?: string; code?: string }) => {
                        this.submitting = false;
                        this.cooldownUntil = Date.now() + 3000;
                        this.result = { ok: false, titleKey: "FAILED", detail: error?.message ?? "" };
                    }
                }
            });
        }
    }
});
