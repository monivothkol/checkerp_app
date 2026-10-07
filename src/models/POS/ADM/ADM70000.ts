/** Telegram notification settings — ADM70000 (load) + ADM71000 (save). */

export interface TelegramSettings {
    hasToken?: boolean;
    botUsername?: string;
    enablePaymentAlerts?: boolean;
    enableDailySummary?: boolean;
    dailySummaryTime?: string;
    timezone?: string;
    chatIds?: string | string[];
}
