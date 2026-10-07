import { defineStore } from "pinia";
import RetrieveTelegramSettings from "@/services/api/ADM/retrieveTelegramSettings";
import SaveTelegramSettings from "@/services/api/ADM/saveTelegramSettings";
import POP from "@/core/utilities/pop";
import type { ModuleApiError } from "@/services/api/COMMON/module-api";
import type { SaveMessages } from "@/store/POS/ADM/ADM31000Store";

/** ADM70000 Telegram-settings store: load + save in place (token write-only-on-change). */
export const ADM70000Store = defineStore("ADM70000Store", {
    state: () => ({
        loading: true,
        saving: false,
        hasToken: false,
        botToken: "",
        chatList: [] as string[],
        form: { botUsername: "", enablePaymentAlerts: true, enableDailySummary: true, dailySummaryTime: "20:00", timezone: "Asia/Phnom_Penh" },
        retrieveApi: RetrieveTelegramSettings.getInstance(),
        saveApi: SaveTelegramSettings.getInstance()
    }),
    actions: {
        parseChatIds(raw: unknown): string[] {
            if (Array.isArray(raw)) return raw.map(String);
            if (typeof raw !== "string" || !raw.trim()) return [];
            try { const a = JSON.parse(raw); return Array.isArray(a) ? a.map(String) : []; } catch { return []; }
        },
        load() {
            this.loading = true;
            this.retrieveApi.request({
                dataBody: {},
                listener: {
                    onSuccess: (p) => {
                        this.hasToken = !!p.hasToken;
                        this.form.botUsername = p.botUsername ?? "";
                        this.form.enablePaymentAlerts = p.enablePaymentAlerts ?? true;
                        this.form.enableDailySummary = p.enableDailySummary ?? true;
                        this.form.dailySummaryTime = p.dailySummaryTime ?? "20:00";
                        this.form.timezone = p.timezone ?? "Asia/Phnom_Penh";
                        this.chatList = this.parseChatIds(p.chatIds);
                        this.loading = false;
                    },
                    onFail: () => { this.loading = false; }
                }
            });
        },
        save(msgs: SaveMessages) {
            if (!this.chatList.length) return;
            this.saving = true;
            const payload: Record<string, unknown> = {
                ...this.form,
                chatIds: JSON.stringify(this.chatList)
            };
            // Only send a token when the admin typed a fresh one — blank keeps the stored token.
            if (this.botToken.trim()) payload.botToken = this.botToken.trim();
            this.saveApi.request({
                dataBody: payload,
                listener: {
                    onSuccess: () => {
                        this.saving = false;
                        this.botToken = "";
                        POP.alert({ title: msgs.savedTitle, status: "success", content: msgs.savedMsg });
                    },
                    onFail: (e: ModuleApiError) => {
                        this.saving = false;
                        POP.alert({ title: msgs.failedTitle, status: "error", content: e?.message, errorCode: e?.code });
                    }
                }
            });
        }
    }
});
