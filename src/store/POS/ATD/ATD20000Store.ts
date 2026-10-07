import { defineStore } from "pinia";
import RetrieveCheckInToken from "@/services/api/ATD/retrieveCheckInToken";
import SaveRenewalTime from "@/services/api/ATD/saveRenewalTime";
import POP from "@/core/utilities/pop";

/** ATD20000 check-in QR store: rotating token, countdown and renewal-time save. */
export const ATD20000Store = defineStore("ATD20000Store", {
    state: () => ({
        token: "",
        secondsLeft: 0,
        renewalTime: "07:00",
        savingTime: false,
        tokenApi: RetrieveCheckInToken.getInstance(),
        saveApi: SaveRenewalTime.getInstance()
    }),
    getters: {
        countdownText(state): string {
            const s = Math.max(0, state.secondsLeft);
            const h = Math.floor(s / 3600);
            const m = Math.floor((s % 3600) / 60);
            return h > 0 ? `${h}h ${m}m` : `${m}m ${s % 60}s`;
        }
    },
    actions: {
        loadToken() {
            this.tokenApi.request({
                dataBody: {},
                enableLoading: false,
                listener: {
                    onSuccess: (p) => {
                        this.token = p.token ?? "";
                        this.secondsLeft = Number(p.expiresInSeconds ?? 0);
                        if (p.renewalTime) this.renewalTime = p.renewalTime;
                    },
                    onFail: () => { this.token = ""; }
                }
            });
        },
        /** One-second tick: decrement, refreshing the token once the boundary passes. */
        tick() {
            this.secondsLeft -= 1;
            if (this.secondsLeft <= 0) this.loadToken();
        },
        /** Save the renewal time; `failTitle` is the already-translated alert title. */
        saveRenewalTime(failTitle: string) {
            if (this.savingTime) return;
            this.savingTime = true;
            this.saveApi.request({
                dataBody: { time: this.renewalTime },
                listener: {
                    onSuccess: () => {
                        this.savingTime = false;
                        this.loadToken(); // new boundary → new expiry
                    },
                    onFail: (error: { message?: string; code?: string }) => {
                        this.savingTime = false;
                        POP.alert({ title: failTitle, status: "error", content: error?.message, errorCode: error?.code });
                    }
                }
            });
        }
    }
});
